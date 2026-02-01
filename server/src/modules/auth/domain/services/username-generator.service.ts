import { Injectable } from '@nestjs/common';
import {
  GenerateUsernameProps,
  IUsernameGenerator,
} from '../ports/username-generator.interface';

@Injectable()
export class UsernameGeneratorService implements IUsernameGenerator {
  generate({ email }: GenerateUsernameProps): string {
    const [prefix] = email.split('@');
    // Sanitize: lowercase, keep only alphanumeric, dots, underscores
    const sanitized = prefix.toLowerCase().replace(/[^a-z0-9._]/g, '');

    // Truncate to 45 chars to leave room for suffix
    return sanitized.substring(0, 45);
  }

  appendSuffix(username: string): string {
    // Append _ + 4 random alphanumeric chars
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${username}_${suffix}`;
  }
}
