import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import {
  InjectJwtConfig,
  type JwtConfig,
} from '../../../../configs/jwt.config';

import type { ITokenPayload } from '../../application/ports/token-generator.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectJwtConfig()
    jwtConfiguration: JwtConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfiguration.publicKey,
      algorithms: [jwtConfiguration.algorithm],
    });
  }

  validate(payload: ITokenPayload): ITokenPayload {
    if (!payload.userId) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
