import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // Allow preflight OPTIONS requests to bypass JwtAuthGuard
    if (request.method === 'OPTIONS') {
      return true;
    }
    return super.canActivate(context);
  }
}
