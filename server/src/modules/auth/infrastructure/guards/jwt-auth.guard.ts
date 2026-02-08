import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { METADATA_KEY } from '@shared/constants';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      METADATA_KEY.IS_PUBLIC,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  //   handleRequest(err: any, user: any, info: any) {
  //     // You can throw an exception based on either "info" or "err" arguments
  //     if (err || !user) {
  //       throw err || new UnauthorizedException();
  //     }
  //     return user;
  //   }
}
