import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interface';
import { TokenResponse } from './interfaces/token-response.interface';

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAuthTokens(payload: TokenPayload): Promise<TokenResponse> {
    const accessToken = await this.nestJwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m') as any,
      secret: this.configService.get('JWT_SECRET'),
    });

    const refreshToken = await this.nestJwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d') as any,
      secret: this.configService.get('JWT_SECRET'),
      // JTI or other claims for refresh specifically if needed
    });

    // Parse expiration for response
    // Access token expiration in seconds
    const expiresIn = this.parseDuration(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async verifyAsync<T extends object = any>(token: string): Promise<T> {
    return this.nestJwtService.verifyAsync<T>(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  private parseDuration(duration: string): number {
    // Simple parser for 15m, 1h, 7d etc to seconds
    // Or just use ms library if available, but for now simple
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      case 's':
        return value;
      default:
        return value; // assume seconds or ms? Nest uses string or number(seconds)
    }
  }
}
