import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret =
      configService.get<string>('jwt.accessSecret') ||
      configService.get<string>('jwt.secret') ||
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        'JWT access secret is required. Set JWT_ACCESS_SECRET (or JWT_SECRET).',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    type?: string;
    sub: string;
    email: string;
    name: string;
    number?: string | null;
    orgtype?: string | null;
    ownerId?: string | null;
  }) {
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      number: payload.number,
      orgtype: payload.orgtype,
      ownerId: payload.ownerId,
    };
  }
}
