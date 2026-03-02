import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Logic to validate JWT token
    const request = context.switchToHttp().getRequest();
    // Placeholder logic
    return !!request.headers.authorization;
  }
}
