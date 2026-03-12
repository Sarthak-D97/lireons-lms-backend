import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, timingSafeEqual } from 'crypto';
import { PRISMA_SERVICE, PrismaClient } from '@lireons/database';
import { SignupDto } from './dto/signup.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  number?: string | null;
  orgtype?: string | null;
};

type RefreshTokenPayload = {
  sub: string;
  type: 'refresh';
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate user credentials (used by LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isHashed =
      user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    const passwordMatch = isHashed
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!passwordMatch) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      number: user.phoneNo,
      orgtype: user.orgType,
    };
  }

  /**
   * Generate access + refresh tokens for authenticated user.
   */
  async login(user: AuthUser) {
    return this.issueTokensAndPersistSession(user);
  }

  /**
   * Rotate refresh token and return a new token pair.
   */
  async refreshTokens(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNo: true,
        orgType: true,
        refreshTokenHash: true,
        refreshTokenExpiry: true,
      },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
      await this.clearRefreshTokenData(user.id);
      throw new UnauthorizedException('Refresh token has expired');
    }

    const incomingTokenHash = this.hashRefreshToken(refreshToken);
    if (!this.safeTokenHashCompare(user.refreshTokenHash, incomingTokenHash)) {
      await this.clearRefreshTokenData(user.id);
      throw new UnauthorizedException('Refresh token is invalid or has been reused');
    }

    return this.issueTokensAndPersistSession({
      id: user.id,
      email: user.email,
      name: user.name,
      number: user.phoneNo,
      orgtype: user.orgType,
    });
  }

  /**
   * Revoke refresh token for current session.
   */
  async logout(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        refreshTokenHash: true,
      },
    });

    if (user?.refreshTokenHash) {
      const incomingTokenHash = this.hashRefreshToken(refreshToken);
      if (this.safeTokenHashCompare(user.refreshTokenHash, incomingTokenHash)) {
        await this.clearRefreshTokenData(user.id);
      }
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Sign up: store pending data and send OTP. User is created only after verify-otp.
   */
  async signup(signupDto: SignupDto) {
    const { name, email, password, orgtype, number } = signupDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = this.otpService.generateOTP(6);
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.pendingSignup.upsert({
      where: { email },
      create: {
        email,
        name,
        password: hashedPassword,
        phoneNo: number || null,
        orgType: orgtype || null,
        otp: hashedOTP,
        otpExpiry,
      },
      update: {
        name,
        password: hashedPassword,
        phoneNo: number || null,
        orgType: orgtype || null,
        otp: hashedOTP,
        otpExpiry,
      },
    });

    await this.emailService.sendOTPEmail(email, otp, name);

    return {
      message: 'Verification code sent. Please verify your email to complete signup.',
    };
  }

  /**
   * Send OTP to user's email
   */
  async sendOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.otpService.generateOTP(6);
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp: hashedOTP, otpExpiry },
    });

    await this.emailService.sendOTPEmail(email, otp, user.name);

    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP: create user in DB only after verification, then return token pair.
   */
  async verifyOtp(email: string, otp: string) {
    const pending = await this.prisma.pendingSignup.findUnique({
      where: { email },
    });

    if (!pending) {
      throw new NotFoundException('No signup found for this email. Please sign up first.');
    }

    if (new Date() > pending.otpExpiry) {
      throw new BadRequestException('OTP has expired. Please sign up again.');
    }

    const isValidOTP = await bcrypt.compare(otp, pending.otp);
    if (!isValidOTP) {
      throw new BadRequestException('Invalid OTP');
    }

    const user = await this.prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        phoneNo: pending.phoneNo,
        orgType: pending.orgType,
        provider: 'credentials',
        verified: true,
      },
    });

    await this.prisma.pendingSignup.delete({
      where: { email },
    });

    return this.login({
      id: user.id,
      email: user.email,
      name: user.name,
      number: user.phoneNo,
      orgtype: user.orgType,
    });
  }

  /**
   * Reset password with OTP verification
   */
  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpiry) {
      throw new BadRequestException(
        'No password reset request found. Please request a new one.',
      );
    }

    if (new Date() > user.otpExpiry) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const isOTPValid = await bcrypt.compare(otp, user.otp);
    if (!isOTPValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
        refreshTokenHash: null,
        refreshTokenExpiry: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  /**
   * Handle OAuth callback — create or find user, return token pair.
   */
  async oauthCallback(oauthDto: OAuthCallbackDto) {
    const { provider, email, name } = oauthDto;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: null,
          provider,
          verified: true,
        },
      });
    }

    return this.login({
      id: user.id,
      email: user.email,
      name: user.name,
      number: user.phoneNo,
      orgtype: user.orgType,
    });
  }

  private getAccessTokenSecret(): string {
    const secret =
      this.configService.get<string>('jwt.accessSecret') ||
      this.configService.get<string>('jwt.secret') ||
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      '';

    if (!secret) {
      throw new InternalServerErrorException('JWT access secret is not configured');
    }

    return secret;
  }

  private getRefreshTokenSecret(): string {
    return (
      this.configService.get<string>('jwt.refreshSecret') ||
      process.env.JWT_REFRESH_SECRET ||
      this.getAccessTokenSecret()
    );
  }

  private getAccessTokenExpiry(): string {
    return (
      this.configService.get<string>('jwt.accessExpiresIn') ||
      this.configService.get<string>('jwt.expiresIn') ||
      process.env.JWT_ACCESS_EXPIRES_IN ||
      process.env.JWT_EXPIRES_IN ||
      '15m'
    );
  }

  private getRefreshTokenExpiry(): string {
    return (
      this.configService.get<string>('jwt.refreshExpiresIn') ||
      process.env.JWT_REFRESH_EXPIRES_IN ||
      '30d'
    );
  }

  private buildJwtPayload(user: AuthUser) {
    return {
      type: 'access' as const,
      sub: user.id,
      email: user.email,
      name: user.name,
      number: user.number,
      orgtype: user.orgtype,
    };
  }

  private buildUserResponse(user: AuthUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      number: user.number,
      orgtype: user.orgtype,
    };
  }

  private decodeTokenExpiry(token: string): Date {
    const decodedToken = this.jwtService.decode(token);
    if (
      !decodedToken ||
      typeof decodedToken === 'string' ||
      typeof decodedToken.exp !== 'number'
    ) {
      throw new UnauthorizedException('Unable to parse token expiry');
    }

    return new Date(decodedToken.exp * 1000);
  }

  private verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });

      if (!payload?.sub || payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256')
      .update(`${this.getRefreshTokenSecret()}:${token}`)
      .digest('hex');
  }

  private safeTokenHashCompare(storedHash: string, incomingHash: string): boolean {
    const storedBuffer = Buffer.from(storedHash);
    const incomingBuffer = Buffer.from(incomingHash);

    if (storedBuffer.length !== incomingBuffer.length) {
      return false;
    }

    return timingSafeEqual(storedBuffer, incomingBuffer);
  }

  private async clearRefreshTokenData(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiry: null,
      },
    });
  }

  private async issueTokensAndPersistSession(user: AuthUser) {
    const accessToken = this.jwtService.sign(this.buildJwtPayload(user), {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenExpiry(),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.getRefreshTokenSecret(),
        expiresIn: this.getRefreshTokenExpiry(),
      },
    );

    const accessTokenExpiry = this.decodeTokenExpiry(accessToken);
    const refreshTokenExpiry = this.decodeTokenExpiry(refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        refreshTokenExpiry,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      access_token_expires_at: accessTokenExpiry.toISOString(),
      refresh_token_expires_at: refreshTokenExpiry.toISOString(),
      user: this.buildUserResponse(user),
    };
  }
}
