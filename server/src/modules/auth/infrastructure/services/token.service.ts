import { Injectable, Logger } from '@nestjs/common';

import {
  ITokenPayload,
  TokenType,
} from '../../domain/ports/token-generator.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import {
  InjectTokenStrategy,
  ITokenStrategy,
} from '../../domain/ports/token-strategy.interface';

@Injectable()
export class TokenService implements ITokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly strategies = new Map<
    TokenType,
    ITokenStrategy<ITokenPayload>
  >();

  constructor(
    @InjectTokenStrategy()
    strategies: ITokenStrategy<ITokenPayload>[],
  ) {
    strategies.forEach((s) => this.strategies.set(s.type, s));
  }

  async sign<T extends ITokenPayload>(
    type: TokenType,
    payload: T,
  ): Promise<string> {
    return this.getStrategy(type).sign(payload);
  }

  async verify<T>(type: TokenType, token: string): Promise<T> {
    return this.getStrategy(type).verify(token) as Promise<T>;
  }

  decode<T>(type: TokenType, token: string): T | null {
    return this.getStrategy(type).decode(token) as T | null;
  }

  private getStrategy(type: TokenType): ITokenStrategy<ITokenPayload> {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      throw new Error(`No strategy found for token type: ${type}`);
    }

    return strategy;
  }
}
