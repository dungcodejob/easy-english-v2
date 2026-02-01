import { EntityManager } from '@mikro-orm/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AuthIdentity,
  AuthProvider,
  Tenant,
  User,
  UserRole,
} from '../../domain/entities';
import { IPasswordHasher } from '../../domain/ports/password-hasher.interface';
import { UsernameGeneratorService } from '../../domain/services/username-generator.service';
import { Email, Password, Username } from '../../domain/value-objects';
import { RegisterResponseDto } from '../../dto/responses/register.response.dto';
import { RegisterCommand } from './register.command';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<
  RegisterCommand,
  RegisterResponseDto
> {
  constructor(
    private readonly em: EntityManager,
    private readonly usernameGenerator: UsernameGeneratorService,
    private readonly hasher: IPasswordHasher,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResponseDto> {
    const { email, password, name, tenantName } = command.props;

    // TODO: Phase 4 - Check if email already exists

    // Generate unique username
    const usernameStr = await this.usernameGenerator.generate({ email });
    const username = new Username(usernameStr);

    // Create Value Objects
    const emailVO = Email.create(email);

    // START TRANSACTION
    // We use global EM or create a fork. Since this is a command, we can rely on a transactional decorator or explicit transaction.
    // Ideally, for atomicity across 3 repos, we should wrap in transaction.
    // MikroORM allows using the same EM instance which tracks changes.
    // If request scope is enabled, 'this.em' is unique per request.

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
    // The Password.create creates a prompt promise.
    const passwordVO = await Password.create(password, this.hasher);

    // 4. Create AuthIdentity
    const authIdentity = AuthIdentity.create({
      userId: user.id,
      provider: AuthProvider.LOCAL,
      providerUserId: email,
      password: passwordVO,
    });

    // Persist all
    // Since we are using repositories in other places, we can use them or just persist to EM.
    // Using EM is cleaner for multi-entity transactional save in MikroORM.
    await this.em.persist([tenant, user, authIdentity]).flush();

    return new RegisterResponseDto(user.id, email, tenant.id);
  }
}
