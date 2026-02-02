import { createInjection } from '@shared/utils';
import { Username } from '../value-objects/username.vo';

/**
 * UsernameAvailabilityService (Domain Service)
 *
 * Responsibilities:
 * - Check if username is already taken
 * - Generate unique username with sequential suffix if taken
 */
export interface IUsernameAvailabilityService {
  /**
   * Check if username is available (not taken)
   */
  isAvailable(username: Username): Promise<boolean>;

  /**
   * Ensure username is unique by appending sequential suffix if needed
   * Returns a unique Username value object
   */
  ensureUnique(username: Username): Promise<Username>;
}

const { token, inject, provider } =
  createInjection<IUsernameAvailabilityService>('IUsernameAvailabilityService');

export const InjectUsernameAvailabilityService = inject;
export const usernameAvailabilityServiceToken = token;
export const usernameAvailabilityServiceProvider = provider;
