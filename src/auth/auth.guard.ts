import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = this.extractTokenFromHeader(request);
    if (!authorization) throw new UnauthorizedException('Token is required');
    try {
      const payload = await this.jwtService.verify(authorization, {
        secret: process.env.SECRET_KEY || '',
      });
      request['sub'] = payload;
    } catch {
      throw new UnauthorizedException('Token is invalid');
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers['authorization'];
    if (!authorization) return undefined;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
