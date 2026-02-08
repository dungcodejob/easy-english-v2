import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ITokenPayload } from '../../modules/auth/domain/ports/token-generator.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ITokenPayload => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return request.user;
  },
);
