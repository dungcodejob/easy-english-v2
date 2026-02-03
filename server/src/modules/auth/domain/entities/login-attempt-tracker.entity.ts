import { AggregateRoot, CreateEntityProps } from '@core/ddd';
import { v7 } from 'uuid';

export enum IdentifierType {
  EMAIL = 'EMAIL',
  IP = 'IP',
}

export interface LoginAttemptTrackerProps {
  tenantId: string;
  identifier: string;
  identifierType: IdentifierType;
  attemptCount: number;
  lastAttemptAt: Date;
  lockExpiresAt?: Date;
}

export class LoginAttemptTracker extends AggregateRoot {
  public tenantId: string;
  public identifier: string;
  public identifierType: IdentifierType;
  public attemptCount: number;
  public lastAttemptAt: Date;
  public lockExpiresAt?: Date;

  get isLocked(): boolean {
    if (!this.lockExpiresAt) return false;
    return new Date() < this.lockExpiresAt;
  }

  private constructor(props: CreateEntityProps<LoginAttemptTrackerProps>) {
    super({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
    this.tenantId = props.tenantId;
    this.identifier = props.identifier;
    this.identifierType = props.identifierType;
    this.attemptCount = props.attemptCount;
    this.lastAttemptAt = props.lastAttemptAt;
    this.lockExpiresAt = props.lockExpiresAt;
  }

  static create(
    props: Omit<LoginAttemptTrackerProps, 'attemptCount' | 'lastAttemptAt'>,
  ): LoginAttemptTracker {
    const id = v7();
    return new LoginAttemptTracker({
      id,
      ...props,
      attemptCount: 0,
      lastAttemptAt: new Date(),
    });
  }

  static rehydrate(
    props: CreateEntityProps<LoginAttemptTrackerProps>,
  ): LoginAttemptTracker {
    return new LoginAttemptTracker(props);
  }

  public recordFailedAttempt(
    maxAttempts: number = 5,
    lockDurationMs: number = 15 * 60 * 1000,
  ): void {
    this.attemptCount++;
    this.lastAttemptAt = new Date();
    // this.updatedAt = new Date(); // If base class handles it? Or manual?

    if (this.attemptCount >= maxAttempts) {
      this.lockExpiresAt = new Date(Date.now() + lockDurationMs);
    }
  }

  public reset(): void {
    this.attemptCount = 0;
    this.lockExpiresAt = undefined;
    // this.updatedAt = new Date();
  }

  public getRemainingLockTime(): number {
    if (!this.lockExpiresAt) return 0;
    const remaining = this.lockExpiresAt.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }
}
