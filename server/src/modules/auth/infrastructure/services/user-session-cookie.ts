import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { type AppConfig, InjectAppConfig } from 'src/configs';
import { TokenResultDto } from '../../dto/auth-result.dto';

@Injectable()
export class UserSessionCookie {
  private static readonly COOKIE_NAME = 'easy_english_sid';
  private static readonly COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days
  private static readonly COOKIE_PATH = '/api/auth';

  @InjectAppConfig() appConfig: AppConfig;

  get(request: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return request.cookies[UserSessionCookie.COOKIE_NAME];
  }

  set(response: Response, refreshToken: TokenResultDto) {
    response.cookie(UserSessionCookie.COOKIE_NAME, refreshToken.token, {
      httpOnly: true,
      secure: this.appConfig.isProduction,
      maxAge: UserSessionCookie.COOKIE_MAX_AGE,
      expires: refreshToken.expiresAt,
      path: UserSessionCookie.COOKIE_PATH,
    });
  }

  clear(response: Response) {
    response.clearCookie(UserSessionCookie.COOKIE_NAME);
  }
}
