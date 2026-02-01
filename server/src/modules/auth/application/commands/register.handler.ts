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
import type { IPasswordHasher } from '../../domain/ports/password-hasher.interface';
import type { IUsernameGenerator } from '../../domain/ports/username-generator.interface';
import { Email, Password, Username } from '../../domain/value-objects';
import { RegisterResponseDto } from '../../dto/responses/register.response.dto';
import { RegisterCommand } from './register.command';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<
  RegisterCommand,
  RegisterResponseDto
> {
  private readonly logger = new Logger(RegisterHandler.name);

  constructor(
    private readonly em: EntityManager,
    private readonly usernameGenerator: IUsernameGenerator,
    private readonly hasher: IPasswordHasher,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResponseDto> {
    const { email, password, name, tenantName } = command.props;

    // TODO: Phase 4 - Check if email already exists

    // Generate unique username
    const usernameStr = this.usernameGenerator.generate({ email });
    const username = new Username(usernameStr);

    // Create Value Objects
    const emailVO = Email.create(email);

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

    // Persist all entities atomically
    await this.em.persist([tenant, user, authIdentity]).flush();

    // 5. Emit domain events after successful persist
    tenant.registerEvent();
    user.registerEvent();
    authIdentity.registerEvent();

    // Publish all events
    await Promise.all([
      tenant.publishEvents(this.logger, this.eventEmitter),
      user.publishEvents(this.logger, this.eventEmitter),
      authIdentity.publishEvents(this.logger, this.eventEmitter),
    ]);

    return new RegisterResponseDto(user.id, email, tenant.id);
  }
}
