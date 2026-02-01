import { createInjection } from '@shared/utils';

export interface GenerateUsernameProps {
  email: string;
}

export interface IUsernameGenerator {
  generate(props: GenerateUsernameProps): string;
  appendSuffix(username: string): string;
}

const { token, inject, provider } =
  createInjection<IUsernameGenerator>('IUsernameGenerator');

export const InjectUsernameGenerator = inject;
export const usernameGeneratorToken = token;
export const usernameGeneratorProvider = provider;
