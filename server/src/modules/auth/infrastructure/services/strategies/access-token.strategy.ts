import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectJwtConfig, type JwtConfig } from '../../../../../configs';
import { InvalidTokenPurposeException } from '../../../domain/exceptions/email-already-exists.exception';
import {
  ITokenPayload,
  TokenType,
} from '../../../domain/ports/token-generator.interface';
import { ITokenStrategy } from '../../../domain/ports/token-strategy.interface';

type AccessTokenPayload = ITokenPayload & { purpose: TokenType };

@Injectable()
export class AccessTokenStrategy implements ITokenStrategy<ITokenPayload> {
  readonly type = TokenType.ACCESS;

  constructor(
    private readonly jwtService: JwtService,
    @InjectJwtConfig() private readonly jwtConfig: JwtConfig,
  ) {}

  async sign(payload: ITokenPayload): Promise<string> {
    const payloadWithPurpose: AccessTokenPayload = {
      ...payload,
      purpose: this.type,
    };

    return this.jwtService.signAsync(payloadWithPurpose, {
      privateKey: this.jwtConfig.privateKey as string | Buffer,
      expiresIn: this.jwtConfig.accessTokenExpiration as string | number,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience as string | string[],
      algorithm: this.jwtConfig.algorithm as 'RS256',
    } as any);
  }

  async verify(token: string): Promise<ITokenPayload> {
    const decoded = await this.jwtService.verifyAsync<AccessTokenPayload>(
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

    return decoded;
  }

  decode(token: string): ITokenPayload | null {
    return this.jwtService.decode(token);
  }
}
