import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/core';

import { LoginCommand } from './login.command';
import { AuthProvider } from '../../domain/entities/auth-identity.entity';
import { Session } from '../../domain/entities/session.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/email-already-exists.exception';
import {
  type IPasswordHasher,
  InjectPasswordHasher,
} from '../../domain/ports/password-hasher.interface';
import {
  ITokenPayload,
  TokenType,
} from '../../domain/ports/token-generator.interface';
import {
  type ITokenHasher,
  InjectTokenHasher,
} from '../../domain/ports/token-hasher.interface';
import {
  type ITokenService,
  InjectTokenService,
} from '../../domain/ports/token-service.interface';
import {
  type IAuthIdentityRepository,
  InjectAuthIdentityRepository,
} from '../../domain/repositories/auth-identity.repository.interface';
import {
  type ISessionRepository,
  InjectSessionRepository,
} from '../../domain/repositories/session.repository.interface';
import {
  type IUserRepository,
  InjectUserRepository,
} from '../../domain/repositories/user.repository.interface';
import { AuthResultDto } from '../../dto/auth-result.dto';
import { UserResponseDto } from '../../dto/responses/user.response.dto';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  AuthResultDto
> {
  private readonly logger = new Logger(LoginHandler.name);

  @InjectUserRepository()
  private readonly userRepo: IUserRepository;

  @InjectAuthIdentityRepository()
  private readonly authIdentityRepo: IAuthIdentityRepository;

  @InjectSessionRepository()
  private readonly sessionRepo: ISessionRepository;

  @InjectPasswordHasher()
  private readonly passwordHasher: IPasswordHasher;

  @InjectTokenHasher()
  private readonly tokenHasher: ITokenHasher;

  @InjectTokenService()
  private readonly tokenService: ITokenService;

  constructor(
    private readonly em: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResultDto> {
    const { email, password, ipAddress, userAgent, deviceId } = command.props;

    // 1. Find User
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 2. Find AuthIdentity
    const authIdentity =
      await this.authIdentityRepo.findByProviderAndProviderUserId(
        AuthProvider.LOCAL,
        email,
      );

    if (!authIdentity) {
      throw new InvalidCredentialsException();
    }

    // 3. Verify Password
    const isValid = await authIdentity.verifyPassword(
      password,
      this.passwordHasher,
    );

    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    // 4. Session Management (Limit 5)
    // TODO: move max sessions to config
    const MAX_SESSIONS = 5;
    const activeSessions = await this.sessionRepo.findActiveByUserId(user.id);

    if (activeSessions.length >= MAX_SESSIONS) {
      activeSessions.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const toRevokeCount = activeSessions.length - MAX_SESSIONS + 1;
      const sessionsToRevoke = activeSessions.slice(0, toRevokeCount);

      for (const session of sessionsToRevoke) {
        session.revoke();
        this.sessionRepo.persist(session);
      }
    }

    // 5. Create Session
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = Session.create({
      tenantId: user.tenantId,
      userId: user.id,
      authIdentityId: authIdentity.id,
      expiresAt: sessionExpiresAt,
      ipAddress,
      userAgent,
      deviceId,
    });

    // 6. Generate Tokens
    const payload: ITokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email.value,
    };

    // Note: We are generating tokens here to pass back to the controller
    // which will set them as cookies.
    // Ideally, we might want to return just the session ID and let the controller handle token generation
    // but the requirements say "System returns access & refresh tokens".
    // For separation of concerns, the Application layer (Command) logic regarding *what* tokens are valid
    // belongs here. The formatting (cookies vs body) belongs in keys.

    // Using Promise.all for parallelism
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.sign(TokenType.ACCESS, payload),
      this.tokenService.sign(TokenType.REFRESH, payload),
    ]);

    const refreshTokenHash = await this.tokenHasher.hash(refreshToken);

    // We rely on the repository implementation or an interceptor to publish these events
    // but typically we should ensure they are dispatched.
    // For now assuming the infrastructure handles event dispatching on persist or commit.

    session.setRefreshTokenHash(refreshTokenHash);
    this.sessionRepo.persist(session);

    await this.em.flush();

    session.publishEvents(this.logger, this.eventBus);

    const userDto = new UserResponseDto(
      user.id,
      user.email.value,
      user.tenantId,
    );

    return new AuthResultDto({
      user: userDto,
      sessionId: session.id,
      accessToken: {
        token: accessToken,
        expiresAt: session.expiresAt,
      },
      refreshToken: {
        token: refreshToken,
        expiresAt: session.expiresAt,
      },
    });
  }
}
