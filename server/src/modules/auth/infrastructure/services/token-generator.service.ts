import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ITokenGenerator,
  ITokenPayload,
} from '../../domain/ports/token-generator.interface';

@Injectable()
export class TokenGeneratorService implements ITokenGenerator {
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: ITokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verify(token: string): Promise<ITokenPayload> {
    return this.jwtService.verifyAsync(token);
  }

  decode(token: string): ITokenPayload | null {
    return this.jwtService.decode(token);
  }
}
