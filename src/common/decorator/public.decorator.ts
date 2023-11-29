import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

export const UserDec = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
