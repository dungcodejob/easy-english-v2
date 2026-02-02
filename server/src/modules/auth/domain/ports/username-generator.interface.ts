import { createInjection } from '@shared/utils';
import { Username } from '../value-objects/username.vo';

export interface GenerateUsernameProps {
  email: string;
}

/**
 * UsernameGenerator (Domain Service)
 *
 * Responsibilities:
 * - Stateless
 * - Does NOT call DB
 * - Only generates candidate username from email
 */
export interface IUsernameGenerator {
  generate(props: GenerateUsernameProps): Username;
}

const { token, inject, provider } =
  createInjection<IUsernameGenerator>('IUsernameGenerator');

export const InjectUsernameGenerator = inject;
export const usernameGeneratorToken = token;
export const usernameGeneratorProvider = provider;
