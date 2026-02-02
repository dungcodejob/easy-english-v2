import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { IUsernameAvailabilityService } from '../../domain/ports/username-availability.interface';
import { Username } from '../../domain/value-objects/username.vo';
import { UserOrmEntity } from '../persistence/user.orm-entity';

/**
 * UsernameAvailabilityService Implementation
 *
 * Checks username uniqueness against the database
 * and generates sequential suffixes for conflicts.
 */
@Injectable()
export class UsernameAvailabilityService implements IUsernameAvailabilityService {
  constructor(private readonly em: EntityManager) {}

  async isAvailable(username: Username): Promise<boolean> {
    const count = await this.em.count(UserOrmEntity, {
      username: username.value,
    });
    return count === 0;
  }

  async ensureUnique(username: Username): Promise<Username> {
    // Check if original username is available
    if (await this.isAvailable(username)) {
      return username;
    }

    // Find next available suffix
    let suffix = 1;
    let candidate = username.withSuffix(suffix);

    while (!(await this.isAvailable(candidate))) {
      suffix++;
      candidate = username.withSuffix(suffix);

      // Safety limit to prevent infinite loop
      if (suffix > 9999) {
        throw new Error(
          'Unable to generate unique username after 9999 attempts',
        );
      }
    }

    return candidate;
  }
}
