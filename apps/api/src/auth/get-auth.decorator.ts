import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ClerkAuthUser } from './auth.guard';

export const GetAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkAuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth;
  },
);
