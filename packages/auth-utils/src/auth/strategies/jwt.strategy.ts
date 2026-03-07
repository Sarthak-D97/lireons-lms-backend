import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const secret =
            configService.get<string>('jwt.secret') || process.env.JWT_SECRET;
        if (!secret) {
            throw new Error(
                'JWT_SECRET is required. Add it to your .env file (e.g. JWT_SECRET=your-secret-key).',
            );
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: { sub: string; email: string; name: string }) {
        return {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
        };
    }
}
