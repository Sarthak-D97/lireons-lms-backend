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
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PRISMA_SERVICE, PrismaClient } from '@lireons/database';
import type { AuthTokenResponse, AuthUserProfile } from '@lireons/shared-types';
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
  ownerId?: string | null;
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
      ownerId: null,
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
      ownerId: null,
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

    const ownerId = await this.ensureTenantOwnerForOrgSignup({
      name: user.name,
      email: user.email,
      passwordHash: user.password,
      phoneNo: user.phoneNo,
      orgType: user.orgType,
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
      ownerId,
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
      ownerId: null,
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
      ownerId: user.ownerId,
    };
  }

  private buildUserResponse(user: AuthUser): AuthUserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      number: user.number,
      orgtype: user.orgtype,
      ownerId: user.ownerId,
    };
  }

  private async ensureTenantOwnerForOrgSignup(input: {
    name: string;
    email: string;
    passwordHash: string | null;
    phoneNo?: string | null;
    orgType?: string | null;
  }): Promise<string | null> {
    const { name, email, passwordHash, phoneNo, orgType } = input;

    if (!orgType) {
      return null;
    }

    if (!passwordHash) {
      return null;
    }

    const owner = await this.prisma.tenantOwner.upsert({
      where: { email },
      create: {
        fullName: name,
        email,
        passwordHash,
        phone: phoneNo || null,
      },
      update: {
        fullName: name,
        passwordHash,
        phone: phoneNo || null,
      },
      select: { id: true },
    });

    return owner.id;
  }

  private async attachOwnerId(user: AuthUser): Promise<AuthUser> {
    if (user.ownerId) {
      return user;
    }

    if (!user.orgtype) {
      return { ...user, ownerId: null };
    }

    const owner = await this.prisma.tenantOwner.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (owner) {
      return {
        ...user,
        ownerId: owner.id,
      };
    }

    // Backfill tenant owner for legacy users who already have org type.
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        password: true,
        phoneNo: true,
        orgType: true,
      },
    });

    if (!dbUser) {
      return {
        ...user,
        ownerId: null,
      };
    }

    const backfilledOwnerId = await this.ensureTenantOwnerForOrgSignup({
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.password,
      phoneNo: dbUser.phoneNo,
      orgType: dbUser.orgType,
    });

    return {
      ...user,
      ownerId: backfilledOwnerId,
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

  /**
   * Generate the provider OAuth redirect URL with signed state.
   */
  getOAuthRedirectUrl(provider: string): string {
    const state = this.generateOAuthState();
    const backendUrl =
      this.configService.get<string>('app.backendUrl') ||
      process.env.BACKEND_URL ||
      'http://localhost:4000';
    const redirectUri = `${backendUrl}/api/auth/oauth/${provider}/callback`;

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) throw new InternalServerErrorException('Google OAuth not configured');
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'openid email profile');
      url.searchParams.set('state', state);
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'select_account');
      return url.toString();
    }

    if (provider === 'github') {
      const clientId = process.env.GITHUB_CLIENT_ID;
      if (!clientId) throw new InternalServerErrorException('GitHub OAuth not configured');
      const url = new URL('https://github.com/login/oauth/authorize');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', 'read:user user:email');
      url.searchParams.set('state', state);
      return url.toString();
    }

    if (provider === 'linkedin') {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      if (!clientId) throw new InternalServerErrorException('LinkedIn OAuth not configured');
      const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'openid profile email');
      url.searchParams.set('state', state);
      return url.toString();
    }

    if (provider === 'facebook') {
      const clientId = process.env.FACEBOOK_APP_ID;
      if (!clientId) throw new InternalServerErrorException('Facebook OAuth not configured');
      const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', 'email,public_profile');
      url.searchParams.set('state', state);
      return url.toString();
    }

    throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
  }

  /**
   * Exchange OAuth authorization code for app JWT tokens.
   */
  async handleOAuthCode(
    provider: string,
    code: string,
    state: string,
  ): Promise<AuthTokenResponse> {
    this.validateOAuthState(state);

    const backendUrl =
      this.configService.get<string>('app.backendUrl') ||
      process.env.BACKEND_URL ||
      'http://localhost:4000';
    const redirectUri = `${backendUrl}/api/auth/oauth/${provider}/callback`;

    if (provider === 'google') {
      return this.handleGoogleCode(code, redirectUri);
    }

    if (provider === 'github') {
      return this.handleGithubCode(code, redirectUri);
    }

    if (provider === 'linkedin') {
      return this.handleLinkedinCode(code, redirectUri);
    }

    if (provider === 'facebook') {
      return this.handleFacebookCode(code, redirectUri);
    }

    throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
  }

  private async handleGoogleCode(
    code: string,
    redirectUri: string,
  ): Promise<AuthTokenResponse> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Google OAuth not configured');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new UnauthorizedException('Google token exchange failed');
    }

    const tokenData = (await tokenRes.json()) as { id_token?: string };
    const rawPayload = tokenData.id_token?.split('.')[1];
    if (!rawPayload) {
      throw new UnauthorizedException('Google ID token missing');
    }

    const userInfo = JSON.parse(
      Buffer.from(rawPayload, 'base64').toString('utf-8'),
    ) as { email?: string; name?: string };

    if (!userInfo.email) {
      throw new BadRequestException('No email returned from Google');
    }

    return this.oauthCallback({
      provider: 'google',
      email: userInfo.email,
      name: userInfo.name || userInfo.email,
    });
  }

  private async handleGithubCode(
    code: string,
    redirectUri: string,
  ): Promise<AuthTokenResponse> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('GitHub OAuth not configured');
    }

    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      },
    );

    if (!tokenRes.ok) {
      throw new UnauthorizedException('GitHub token exchange failed');
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      throw new UnauthorizedException('GitHub OAuth failed: ' + (tokenData.error ?? 'unknown'));
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userRes.ok) {
      throw new UnauthorizedException('Failed to fetch GitHub user info');
    }

    const githubUser = (await userRes.json()) as {
      email?: string | null;
      name?: string | null;
      login?: string;
    };

    let email = githubUser.email ?? null;

    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary?.email ?? null;
      }
    }

    if (!email) {
      throw new BadRequestException(
        'No verified email available from GitHub account',
      );
    }

    return this.oauthCallback({
      provider: 'github',
      email,
      name: githubUser.name || githubUser.login || email,
    });
  }

  private async handleLinkedinCode(
    code: string,
    redirectUri: string,
  ): Promise<AuthTokenResponse> {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('LinkedIn OAuth not configured');
    }

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new UnauthorizedException('LinkedIn token exchange failed');
    }

    const tokenData = (await tokenRes.json()) as { id_token?: string; access_token?: string };

    // LinkedIn OIDC: parse userinfo from id_token if present
    if (tokenData.id_token) {
      const rawPayload = tokenData.id_token.split('.')[1];
      const userInfo = JSON.parse(
        Buffer.from(rawPayload, 'base64').toString('utf-8'),
      ) as { email?: string; name?: string; given_name?: string; family_name?: string };

      const email = userInfo.email;
      if (!email) throw new BadRequestException('No email returned from LinkedIn');

      const name =
        userInfo.name ||
        [userInfo.given_name, userInfo.family_name].filter(Boolean).join(' ') ||
        email;

      return this.oauthCallback({ provider: 'linkedin', email, name });
    }

    // Fallback: use /v2/userinfo endpoint
    if (!tokenData.access_token) {
      throw new UnauthorizedException('LinkedIn OAuth failed: no access token');
    }

    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new UnauthorizedException('Failed to fetch LinkedIn user info');
    }

    const userInfo = (await userRes.json()) as {
      email?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
    };

    const email = userInfo.email;
    if (!email) throw new BadRequestException('No email returned from LinkedIn');

    const name =
      userInfo.name ||
      [userInfo.given_name, userInfo.family_name].filter(Boolean).join(' ') ||
      email;

    return this.oauthCallback({ provider: 'linkedin', email, name });
  }

  private async handleFacebookCode(
    code: string,
    redirectUri: string,
  ): Promise<AuthTokenResponse> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appId || !appSecret) {
      throw new InternalServerErrorException('Facebook OAuth not configured');
    }

    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({
          code,
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
        }),
    );

    if (!tokenRes.ok) {
      throw new UnauthorizedException('Facebook token exchange failed');
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      throw new UnauthorizedException('Facebook OAuth failed: no access token');
    }

    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(tokenData.access_token)}`,
    );

    if (!userRes.ok) {
      throw new UnauthorizedException('Failed to fetch Facebook user info');
    }

    const fbUser = (await userRes.json()) as {
      id?: string;
      name?: string;
      email?: string;
    };

    if (!fbUser.email) {
      throw new BadRequestException(
        'No email available from Facebook. Please ensure your Facebook account has a verified email.',
      );
    }

    return this.oauthCallback({
      provider: 'facebook',
      email: fbUser.email,
      name: fbUser.name || fbUser.email,
    });
  }

  private generateOAuthState(): string {
    const secret = this.getAccessTokenSecret();
    const nonce = randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();
    const payload = `${nonce}.${timestamp}`;
    const sig = createHmac('sha256', secret).update(payload).digest('hex');
    return Buffer.from(`${payload}.${sig}`).toString('base64url');
  }

  private validateOAuthState(state: string): void {
    const secret = this.getAccessTokenSecret();
    let decoded: string;
    try {
      decoded = Buffer.from(state, 'base64url').toString('utf-8');
    } catch {
      throw new UnauthorizedException('Invalid OAuth state');
    }

    const dotIndex1 = decoded.indexOf('.');
    const dotIndex2 = decoded.indexOf('.', dotIndex1 + 1);
    if (dotIndex1 === -1 || dotIndex2 === -1) {
      throw new UnauthorizedException('Invalid OAuth state format');
    }

    const nonce = decoded.slice(0, dotIndex1);
    const timestamp = decoded.slice(dotIndex1 + 1, dotIndex2);
    const sig = decoded.slice(dotIndex2 + 1);
    const payload = `${nonce}.${timestamp}`;
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      throw new UnauthorizedException('OAuth state signature invalid');
    }

    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 10 * 60 * 1000) {
      throw new UnauthorizedException('OAuth state expired');
    }
  }

  private async issueTokensAndPersistSession(user: AuthUser): Promise<AuthTokenResponse> {
    const userWithOwner = await this.attachOwnerId(user);

    const accessToken = this.jwtService.sign(this.buildJwtPayload(userWithOwner), {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenExpiry(),
    });

    const refreshToken = this.jwtService.sign(
      { sub: userWithOwner.id, type: 'refresh' },
      {
        secret: this.getRefreshTokenSecret(),
        expiresIn: this.getRefreshTokenExpiry(),
      },
    );

    const accessTokenExpiry = this.decodeTokenExpiry(accessToken);
    const refreshTokenExpiry = this.decodeTokenExpiry(refreshToken);

    await this.prisma.user.update({
      where: { id: userWithOwner.id },
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
      user: this.buildUserResponse(userWithOwner),
    };
  }
}
