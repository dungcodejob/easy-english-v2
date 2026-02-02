import { EntityManager } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuthIdentity,
  AuthProvider,
  Tenant,
  User,
  UserRole,
} from '../../domain/entities';
import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import {
  InjectPasswordHasher,
  type IPasswordHasher,
} from '../../domain/ports/password-hasher.interface';
import {
  InjectUsernameAvailabilityService,
  type IUsernameAvailabilityService,
} from '../../domain/ports/username-availability.interface';
import {
  InjectUsernameGenerator,
  type IUsernameGenerator,
} from '../../domain/ports/username-generator.interface';
import { Email, Password, Username } from '../../domain/value-objects';
import { RegisterResponseDto } from '../../dto/responses/register.response.dto';
import { AuthIdentityRepository } from '../../infrastructure/repositories/auth-identity.repository';
import { RegisterCommand } from './register.command';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<
  RegisterCommand,
  RegisterResponseDto
> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectUsernameGenerator()
    private readonly usernameGenerator: IUsernameGenerator,
    @InjectUsernameAvailabilityService()
    private readonly usernameAvailability: IUsernameAvailabilityService,

    private readonly authIdentityRepository: AuthIdentityRepository,
    @InjectPasswordHasher()
    private readonly hasher: IPasswordHasher,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResponseDto> {
    const { email, password, name, tenantName } = command.props;

    // Phase 4: Check if email already exists
    const existingUser =
      await this.authIdentityRepository.findByProviderAndProviderUserId(
        AuthProvider.LOCAL,
        email,
      );
    if (existingUser) {
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

    // 3. Create Password (Hash)
    const passwordVO = await Password.create(password, this.hasher);

    // 4. Create AuthIdentity
    const authIdentity = AuthIdentity.create({
      userId: user.id,
      provider: AuthProvider.LOCAL,
      providerUserId: email,
      password: passwordVO,
    });

    this.em.persist(tenant);
    this.em.persist(user);
    this.em.persist(authIdentity);
    // Persist all entities atomically
    await this.em.flush();

    // Publish all events
    await Promise.all([
      tenant.publishEvents(this.logger, this.eventEmitter),
      user.publishEvents(this.logger, this.eventEmitter),
      authIdentity.publishEvents(this.logger, this.eventEmitter),
    ]);

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
