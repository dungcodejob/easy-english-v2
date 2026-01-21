export interface TokenPayload {
  userId: string;
  tokenVersion: number;
  tenantId: string;
  iat?: number;
  exp?: number;
  // For refresh tokens
  sessionId?: string;
  jti?: string;
}
