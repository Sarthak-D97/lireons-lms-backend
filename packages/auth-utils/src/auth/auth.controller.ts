import { Controller, Post, Get, Body, UseGuards, Request, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request()
    req: {
      user: {
        id: string;
        email: string;
        name: string;
        number?: string | null;
        orgtype?: string | null;
        ownerId?: string | null;
      };
    },
  ) {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.otp,
      resetPasswordDto.newPassword,
    );
  }

  @Post('oauth-callback')
  async oauthCallback(@Body() oauthCallbackDto: OAuthCallbackDto) {
    return this.authService.oauthCallback(oauthCallbackDto);
  }

  @Get('oauth/:provider/start')
  oauthStart(@Param('provider') provider: string, @Res() res: Response) {
    const url = this.authService.getOAuthRedirectUrl(provider);
    res.redirect(url);
  }

  @Get('oauth/:provider/callback')
  async oauthProviderCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      const auth = await this.authService.handleOAuthCode(provider, code, state);
      const encoded = Buffer.from(JSON.stringify(auth)).toString('base64url');
      res.redirect(`${frontendUrl}/auth-callback#session=${encoded}`);
    } catch {
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
}
