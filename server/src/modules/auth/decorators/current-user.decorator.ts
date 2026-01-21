import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../../../core/jwt/interfaces/token-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: TokenPayload }>();
    return request.user;
  },
);
