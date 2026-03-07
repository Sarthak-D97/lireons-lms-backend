import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor(private readonly configService: ConfigService) {
        const user = (this.configService.get<string>('email.user') ?? process.env.EMAIL_USER)?.trim();
        const pass = (this.configService.get<string>('email.password') ?? process.env.EMAIL_PASSWORD)?.trim();
        if (user && pass) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass },
            });
        } else {
            this.transporter = null;
        }
    }

    async sendOTPEmail(email: string, otp: string, name: string): Promise<{ success: boolean; error?: unknown }> {
        if (!this.transporter) {
            console.warn(
                '[EmailService] EMAIL_USER/EMAIL_PASSWORD not set. OTP not sent. For dev, use this OTP:',
                otp,
                `(for ${email})`,
            );
            return { success: true };
        }

        const logoUrl = 'https://www.lireons.com/logo.png';
        const emailUser = (this.configService.get<string>('email.user') ?? process.env.EMAIL_USER)?.trim();

        const mailOptions = {
            from: `"Lireons Security" <${emailUser}>`,
            to: email,
            subject: `${otp} is your Lireons verification code`,
            text: `Hi ${name},\n\nYour verification code for Lireons is: ${otp}\n\nThis code expires in 10 minutes.\n\n© 2025 Lireons ERP`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
              .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
              .header { background: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #4f46e5; }
              .logo { height: 130px; width: auto; display: block; margin: 0 auto; }
              .content { padding: 40px 30px; text-align: center; }
              .welcome-text { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 10px; }
              .sub-text { color: #6b7280; font-size: 16px; margin-bottom: 30px; }
              .otp-wrapper { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 0 auto 30px auto; max-width: 300px; }
              .otp-label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 1px; margin-bottom: 10px; display: block; }
              .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 4px; display: block; border: none; background: transparent; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
              .links { margin-top: 10px; }
              .links a { color: #4f46e5; text-decoration: none; margin: 0 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${logoUrl}" alt="Lireons Logo" class="logo">
              </div>
              <div class="content">
                <h1 class="welcome-text">Verify Your Email</h1>
                <p class="sub-text">Hi ${name}, use the code below to complete your setup for the Lireons ERP platform.</p>
                <div class="otp-wrapper">
                  <span class="otp-label">Verification Code</span>
                  <span class="otp-code">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #6b7280;">This code will expire in 10 minutes.</p>
                <div style="margin-top: 30px; font-size: 13px; color: #9ca3af;">
                  If you didn't request this, you can safely ignore this email.
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2025 Lireons. Building the Future of Education.</p>
                <div class="links">
                  <a href="#">Privacy Policy</a> • <a href="#">Support</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error };
        }
    }
}
