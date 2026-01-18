import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessToken: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'accessSecret',
    expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRED) || 60000,
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecret',
    expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRED) || 3600000,
  },
}));

export type JwtConfig = ConfigType<typeof jwtConfig>;
export const InjectJwtConfig = () => Inject(jwtConfig.KEY);
