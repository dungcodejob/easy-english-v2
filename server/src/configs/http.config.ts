import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { ENV_KEY } from '@shared/constants';

export const httpConfig = registerAs('http', () => {
  const rawCorsOrigins = process.env[ENV_KEY.CORS_ORIGINS];

  return {
    version: process.env.HTTP_VERSION || '1',
    versioningEnable: process.env.HTTP_VERSIONING_ENABLE || false,
    versioningPrefix: process.env.HTTP_VERSIONING_PREFIX || 'v',
    corsOrigins: rawCorsOrigins
      ? rawCorsOrigins.split(',').map((origin) => origin.trim())
      : ['http://localhost:4200'],
  };
});

export type HttpConfig = ConfigType<typeof httpConfig>;
export const InjectHttpConfig = () => Inject(httpConfig.KEY);
