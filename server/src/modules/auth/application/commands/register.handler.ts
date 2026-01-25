import { EntityManager } from '@mikro-orm/core';
import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../../core/jwt/jwt.service';
import { PasswordService } from '../../../../core/security/password.service';
import { Account } from '../../domain/entities/account.entity';
import { Session } from '../../domain/entities/session.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { User } from '../../domain/entities/user.entity';
import { AccountType } from '../../domain/enums/account-type.enum';
import type { IAccountRepository } from '../../domain/repositories/account.repository.interface';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { AuthTokensDto } from '../../dto/responses/auth-tokens.dto';
import { RegisterCommand } from './register.command';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('IAccountRepository')
    private readonly accountRepo: IAccountRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepo: ISessionRepository,
    @Inject('ITenantRepository') private readonly tenantRepo: ITenantRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly em: EntityManager,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthTokensDto> {
    const { email, password } = command.dto;

    // 1. Check if email already exists
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Generate unique username
    const username = await this.generateUniqueUsername(email);

    // 3. Hash password
    const hashedPassword = await this.passwordService.hash(password);

    // 4. Create entities in transaction
    const { user, session } = await this.em.transactional(async () => {
      // Create Tenant
      const tenant = new Tenant({
        name: `${username}'s Workspace`,
        slug: username,
      });
      await this.tenantRepo.create(tenant);

      const newUser = new User({
        email,
        username,
        tenantId: tenant.id,
        tokenVersion: 0,
      });
      await this.userRepo.create(newUser);

      const newAccount = new Account({
        userId: newUser.id,
        type: AccountType.LOCAL,
        email,
        passwordHash: hashedPassword,
        providerId: 'local',
      });
      await this.accountRepo.create(newAccount);
      newUser.addAccount(newAccount);

      const newSession = new Session({
        userId: newUser.id,
        identifier: 'unknown', // Placeholder until we have device info in Command
      });
      await this.sessionRepo.create(newSession);
      newUser.addSession(newSession);

      return { user: newUser, session: newSession };
    });

    // 5. Generate tokens
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      tokenVersion: user.tokenVersion,
      sessionId: session.id,
    };

    const tokens = await this.jwtService.generateAuthTokens(payload);

    return tokens;
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const prefix = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    let username = prefix;
    let counter = 1;

    while (await this.userRepo.findByUsername(username)) {
      username = `${prefix}${counter}`;
      counter++;
    }

    return username;
  }
}
