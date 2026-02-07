import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export const jwtConfig = registerAs('jwt', () => {
  const privateKeyPath =
    process.env.JWT_SECRET_KEY_PATH || './keys/private-key.pem';
  const publicKeyPath =
    process.env.JWT_PUBLIC_KEY_PATH || './keys/public-key.pem';

  // Read private key for signing
  const privateKey = fs.existsSync(privateKeyPath)
    ? fs.readFileSync(path.resolve(privateKeyPath), 'utf8')
    : process.env.JWT_SECRET || 'default-secret-change-in-production';

  // Read public key for verification
  const publicKey = fs.existsSync(publicKeyPath)
    ? fs.readFileSync(path.resolve(publicKeyPath), 'utf8')
    : process.env.JWT_SECRET || 'default-secret-change-in-production';

  return {
    privateKey,
    publicKey,
    accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '7d',
    refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '30d',
    issuer: process.env.JWT_ISSUER || 'easy-english-v2',
    audience: process.env.JWT_AUDIENCE || 'easy-english-client',
    algorithm: 'RS256' as const, // Using RSA with SHA-256
  };
});

export type JwtConfig = ConfigType<typeof jwtConfig>;
export const InjectJwtConfig = () => Inject(jwtConfig.KEY);
