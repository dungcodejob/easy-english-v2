import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { ITokenPayload } from '@auth/application/ports/token-generator.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ITokenPayload => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
