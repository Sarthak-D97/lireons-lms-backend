import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@lireons/database';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './services/otp.service';
import { EmailService } from './services/email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || process.env.JWT_SECRET,
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '30d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, EmailService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule { }
