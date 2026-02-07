import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Injectable()
export class UserSessionCookie {
  private static readonly COOKIE_NAME = 'easy_english_sid';
  private static readonly COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days
  private static readonly COOKIE_PATH = '/api/auth';

  constructor(private readonly configService: ConfigService) {}

  get(request: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return request.cookies[UserSessionCookie.COOKIE_NAME];
  }

  set(response: Response, sessionId: string, expiresAt: Date) {
    response.cookie(UserSessionCookie.COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: UserSessionCookie.COOKIE_MAX_AGE,
      expires: expiresAt,
      path: UserSessionCookie.COOKIE_PATH,
    });
  }

  clear(response: Response) {
    response.clearCookie(UserSessionCookie.COOKIE_NAME);
  }
}
