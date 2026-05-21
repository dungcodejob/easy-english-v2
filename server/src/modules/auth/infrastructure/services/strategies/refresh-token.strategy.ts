import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { type StringValue } from 'ms';

import { InjectJwtConfig, type JwtConfig } from '../../../../../configs';
import {
  ITokenPayload,
  TokenType,
} from '../../../application/ports/token-generator.interface';
import { ITokenStrategy } from '../../../application/ports/token-strategy.interface';
import { InvalidTokenPurposeException } from '../../../domain/exceptions/email-already-exists.exception';

type RefreshTokenPayload = ITokenPayload & { purpose: TokenType };

@Injectable()
export class RefreshTokenStrategy implements ITokenStrategy<ITokenPayload> {
  readonly type = TokenType.REFRESH;

  constructor(
    private readonly jwtService: JwtService,
    @InjectJwtConfig() private readonly jwtConfig: JwtConfig,
  ) {}

  async sign(payload: ITokenPayload): Promise<string> {
    const payloadWithPurpose: RefreshTokenPayload = {
      ...payload,
      purpose: this.type,
    };

    const options: JwtSignOptions = {
      privateKey: this.jwtConfig.privateKey as string | Buffer,
      expiresIn: this.jwtConfig.refreshTokenExpiration as StringValue | number,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience as string | string[],
      algorithm: this.jwtConfig.algorithm as 'RS256',
    };

    return this.jwtService.signAsync(payloadWithPurpose, options);
  }

  async verify(token: string): Promise<ITokenPayload> {
    const decoded = await this.jwtService.verifyAsync<RefreshTokenPayload>(
      token,
      {
        publicKey: this.jwtConfig.publicKey,
        issuer: this.jwtConfig.issuer,
        audience: this.jwtConfig.audience,
        algorithms: [this.jwtConfig.algorithm],
      },
    );

    if (decoded.purpose !== this.type) {
      throw new InvalidTokenPurposeException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { purpose, ...rest } = decoded;

    return rest;
  }

  decode(token: string): ITokenPayload | null {
    return this.jwtService.decode(token);
  }
}
