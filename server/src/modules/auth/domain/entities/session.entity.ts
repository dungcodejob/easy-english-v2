export class Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  identifier: string; // Device/Browser info
  userIp: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  lastActivityAt: Date;
  deletedAt?: Date;

  constructor(partial: Partial<Session>) {
    Object.assign(this, partial);
  }
}
