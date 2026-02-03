import { AggregateRoot, CreateEntityProps } from '@core/ddd';
import { v7 } from 'uuid';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export interface SessionProps {
  tenantId: string;
  userId: string;
  authIdentityId?: string;
  refreshTokenHash?: string;
  status: SessionStatus;
  expiresAt: Date;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class Session extends AggregateRoot {
  // _id inherited

  public tenantId: string;
  public userId: string;
  public authIdentityId?: string;
  public refreshTokenHash?: string;
  public status: SessionStatus;
  public expiresAt: Date;
  public deviceId?: string;
  public ipAddress?: string;
  public userAgent?: string;

  private constructor(props: CreateEntityProps<SessionProps>) {
    super({
      id: props.id,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
    this.tenantId = props.tenantId;
    this.userId = props.userId;
    this.authIdentityId = props.authIdentityId;
    this.refreshTokenHash = props.refreshTokenHash;
    this.status = props.status;
    this.expiresAt = props.expiresAt;
    this.deviceId = props.deviceId;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
  }

  static create(
    props: Omit<SessionProps, 'status'> & { status?: SessionStatus },
  ): Session {
    const id = v7();
    return new Session({
      id,
      ...props,
      status: props.status || SessionStatus.ACTIVE,
    });
  }

  static rehydrate(props: CreateEntityProps<SessionProps>): Session {
    return new Session(props);
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isValid(): boolean {
    return this.status === SessionStatus.ACTIVE && !this.isExpired();
  }

  public revoke(): void {
    if (this.status === SessionStatus.ACTIVE) {
      this.status = SessionStatus.REVOKED;
      this.updateUpdatedAt();
    }
  }
}
