import { Injectable } from '@nestjs/common';

import {
  GenerateUsernameProps,
  IUsernameGenerator,
} from '../../application/ports/username-generator.interface';
import { Username } from '../value-objects/username.vo';

/**
 * UsernameGenerator (Domain Service)
 *
 * Responsibilities:
 * - Stateless
 * - Does NOT call DB
 * - Only generates candidate username from email
 *
 * The generated username is a candidate that needs
 * to be checked for availability by UsernameAvailabilityService.
 */
@Injectable()
export class UsernameGeneratorService implements IUsernameGenerator {
  /**
   * Generate candidate username from email
   * Uses Username VO's normalization
   */
  generate({ email }: GenerateUsernameProps): Username {
    const [localPart] = email.split('@');

    return Username.create(localPart);
  }
}
