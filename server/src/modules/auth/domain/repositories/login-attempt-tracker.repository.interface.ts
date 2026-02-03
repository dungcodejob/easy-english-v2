import { createInjection } from '@shared/utils';
import { LoginAttemptTracker } from '../entities/login-attempt-tracker.entity';

export interface ILoginAttemptTrackerRepository {
  persist(tracker: LoginAttemptTracker): void;
  findByIdentifier(
    tenantId: string,
    identifier: string,
    identifierType: string,
  ): Promise<LoginAttemptTracker | null>;
}

const { inject, provider, token } =
  createInjection<ILoginAttemptTrackerRepository>(
    'ILoginAttemptTrackerRepository',
  );

export const injectLoginAttemptTrackerRepository = inject;
export const loginAttemptTrackerRepositoryProvider = provider;
export const loginAttemptTrackerRepositoryToken = token;
