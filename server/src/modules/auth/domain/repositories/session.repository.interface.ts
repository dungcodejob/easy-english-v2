import { createInjection } from '@shared/utils';
import { Session } from '../entities/session.entity';

export interface ISessionRepository {
  persist(session: Session): void;
  findById(id: string): Promise<Session | null>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  countActiveByUserId(userId: string): Promise<number>;
}

const { inject, provider, token } =
  createInjection<ISessionRepository>('ISessionRepository');

export const InjectSessionRepository = inject;
export const sessionRepositoryProvider = provider;
export const sessionRepositoryToken = token;
