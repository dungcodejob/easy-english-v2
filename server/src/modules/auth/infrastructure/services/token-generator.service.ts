import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtConfig } from '../../../../configs';
import { InjectJwtConfig } from '../../../../configs';
import {
  ITokenGenerator,
  ITokenPayload,
  TokenType,
} from '../../domain/ports/token-generator.interface';

@Injectable()
export class TokenGeneratorService implements ITokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    @InjectJwtConfig() private readonly jwtConfig: JwtConfig,
  ) {}

  async sign(payload: ITokenPayload, tokenType: TokenType): Promise<string> {
    const expiresIn =
      tokenType === TokenType.ACCESS
        ? this.jwtConfig.accessTokenExpiration
        : this.jwtConfig.refreshTokenExpiration;

    return this.jwtService.signAsync(payload, {
      privateKey: this.jwtConfig.privateKey as string | Buffer,
      expiresIn: expiresIn as string | number,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience as string | string[],
      algorithm: this.jwtConfig.algorithm as 'RS256',
    } as any);
  }

  async verify(token: string): Promise<ITokenPayload> {
    return this.jwtService.verifyAsync(token, {
      publicKey: this.jwtConfig.publicKey,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience,
      algorithms: [this.jwtConfig.algorithm],
    });
  }

  decode(token: string): ITokenPayload | null {
    return this.jwtService.decode(token);
  }
}
