import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import type { ClerkAuthUser } from './auth.guard';

@Injectable()
export class AdminGuard extends AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const auth = request.auth as ClerkAuthUser;

    if (auth.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
