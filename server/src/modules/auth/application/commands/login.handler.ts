import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../../core/jwt/jwt.service';
import { PasswordService } from '../../../../core/security/password.service';
import { Session } from '../../domain/entities/session.entity';
import { AccountType } from '../../domain/enums/account-type.enum';
import type { IAccountRepository } from '../../domain/repositories/account.repository.interface';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { AuthTokensDto } from '../../dto/responses/auth-tokens.dto';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('IAccountRepository')
    private readonly accountRepo: IAccountRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepo: ISessionRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokensDto> {
    const { identifier, password } = command.dto;

    // 1. Find User by Email OR Username
    // For now, let's try finding by email first, then username.
    let user = await this.userRepo.findByEmail(identifier);
    if (!user) {
      user = await this.userRepo.findByUsername(identifier);
    }

    if (!user) {
      // Use generic error message to avoid enumeration
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Find LOCAL Account for this User
    const account = await this.accountRepo.findByUserIdAndType(
      user.id,
      AccountType.LOCAL,
    );
    if (!account || !account.passwordHash) {
      // User exists but has no local account (e.g. only OAuth), or password missing
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Validate Password
    const isPasswordValid = await this.passwordService.compare(
      password,
      account.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Create Session
    const session = new Session({
      userId: user.id,
      identifier: 'unknown', // TODO: Add device info to LoginCommand
    });
    await this.sessionRepo.create(session);

    // 5. Generate Tokens
    // We can update User sessions collection but it's not strictly needed for just generating tokens unless we save User.
    // user.addSession(session);
    // We already persisted session.

    const tokens = await this.jwtService.generateAuthTokens({
      userId: user.id,
      tenantId: user.tenantId,
      tokenVersion: user.tokenVersion,
      sessionId: session.id,
    });

    return tokens;
  }
}
