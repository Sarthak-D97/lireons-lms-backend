import {
    Injectable,
    Inject,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@lireons/database';
import { PRISMA_SERVICE } from '@lireons/database';
import { SignupDto } from './dto/signup.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(PRISMA_SERVICE) private readonly prisma: PrismaClient,
        private readonly jwtService: JwtService,
        private readonly otpService: OtpService,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Validate user credentials (used by LocalStrategy)
     */
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return null;
        }

        if (!user.password) {
            return null;
        }

        const isHashed =
            user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

        let passwordMatch = false;

        if (isHashed) {
            passwordMatch = await bcrypt.compare(password, user.password);
        } else {
            passwordMatch = password === user.password;
        }

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
     * Generate JWT token for authenticated user
     */
    async login(user: { id: string; email: string; name: string; number?: string | null; orgtype?: string | null }) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            number: user.number,
            orgtype: user.orgtype,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                number: user.number,
                orgtype: user.orgtype,
            },
        };
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

        return { message: 'Verification code sent. Please verify your email to complete signup.' };
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
     * Verify OTP: create user in DB only after verification, then return JWT.
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
            data: { password: hashedPassword, otp: null, otpExpiry: null },
        });

        return { message: 'Password reset successful' };
    }

    /**
     * Handle OAuth callback — create or find user, return JWT
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
            console.log('✅ New OAuth user created:', email);
        }

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            number: user.phoneNo,
            orgtype: user.orgType,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                number: user.phoneNo,
                orgtype: user.orgType,
            },
        };
    }
}
