import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/core';

import { RegisterCommand } from './register.command';
import {
  AuthIdentity,
  AuthProvider,
  Tenant,
  User,
  UserRole,
} from '../../domain/entities';
import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import { Email, Password, Username } from '../../domain/value-objects';
import { RegisterResponseDto } from '../../dto/responses/register.response.dto';
import {
  InjectPasswordHasher,
  type IPasswordHasher,
} from '../ports/password-hasher.interface';
import {
  InjectUsernameAvailability,
  type IUsernameAvailabilityService,
} from '../ports/username-availability.interface';
import {
  InjectUsernameGenerator,
  type IUsernameGenerator,
} from '../ports/username-generator.interface';
import {
  InjectAuthIdentityRepository,
  type IAuthIdentityRepository,
} from '../repositories/auth-identity.repository.interface';
import {
  injectTenantRepository,
  type ITenantRepository,
} from '../repositories/tenant.repository.interface';
import {
  InjectUserRepository,
  type IUserRepository,
} from '../repositories/user.repository.interface';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<
  RegisterCommand,
  RegisterResponseDto
> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(
    private readonly em: EntityManager,

    // Repositories (following DI pattern)
    @injectTenantRepository()
    private readonly tenantRepo: ITenantRepository,
    @InjectUserRepository()
    private readonly userRepo: IUserRepository,
    @InjectAuthIdentityRepository()
    private readonly authIdentityRepo: IAuthIdentityRepository,

    // Domain services
    @InjectPasswordHasher()
    private readonly hasher: IPasswordHasher,
    @InjectUsernameGenerator()
    private readonly usernameGenerator: IUsernameGenerator,
    @InjectUsernameAvailability()
    private readonly usernameAvailability: IUsernameAvailabilityService,

    // Infrastructure
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResponseDto> {
    const { email, password, name, tenantName } = command.props;

    // Phase 4: Check if email already exists
    const existingAuthIdentity =
      await this.authIdentityRepo.findByProviderAndProviderUserId(
        AuthProvider.LOCAL,
        email,
      );

    if (existingAuthIdentity) {
      throw new EmailAlreadyExistsException(email);
    }

    // Create Value Objects
    const emailVO = Email.create(email);

    // Resolve username (DDD flow)
    const username = await this.resolveUsername(email);

    // 1. Create Tenant
    const tenant = Tenant.create({
      name: tenantName || `${name}'s Workspace`,
    });

    // 2. Create User
    const user = User.create({
      tenantId: tenant.id,
      email: emailVO,
      username: username,
      name: name,
      role: UserRole.ADMIN,
    });

    const passwordHashed = await this.hasher.hash(password);
    // 3. Create Password (Hash)
    const passwordVO = Password.create(passwordHashed);

    // 4. Create AuthIdentity
    const authIdentity = AuthIdentity.create({
      userId: user.id,
      provider: AuthProvider.LOCAL,
      providerUserId: email,
      password: passwordVO,
    });

    // 5: Persist all entities (repositories handle domain→ORM conversion internally)
    this.tenantRepo.persist(tenant);
    this.userRepo.persist(user);
    this.authIdentityRepo.persist(authIdentity);

    // Persist all entities atomically
    await this.em.flush();

    // Publish all events
    tenant.publishEvents(this.logger, this.eventBus);
    user.publishEvents(this.logger, this.eventBus);
    authIdentity.publishEvents(this.logger, this.eventBus);

    return new RegisterResponseDto(user.id, email, tenant.id);
  }

  /**
   * Resolve username following DDD flow:
   * 1. Generate candidate from email
   * 2. Ensure uniqueness with sequential suffix if needed
   */
  private async resolveUsername(email: string): Promise<Username> {
    // Generate candidate using domain service
    const candidate = this.usernameGenerator.generate({ email });

    // Ensure unique using availability service
    return this.usernameAvailability.ensureUnique(candidate);
  }
}
