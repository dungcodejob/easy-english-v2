import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthProvider } from '../../domain/entities/auth-identity.entity';
import { Session } from '../../domain/entities/session.entity';
import {
  type IPasswordHasher,
  InjectPasswordHasher,
} from '../../domain/ports/password-hasher.interface';
import {
  type ITokenGenerator,
  ITokenPayload,
  injectTokenGenerator,
} from '../../domain/ports/token-generator.interface';
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
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  AuthResultDto
> {
  @InjectUserRepository()
  private readonly userRepo: IUserRepository;

  @InjectAuthIdentityRepository()
  private readonly authIdentityRepo: IAuthIdentityRepository;

  @InjectSessionRepository()
  private readonly sessionRepo: ISessionRepository;

  @InjectPasswordHasher()
  private readonly passwordHasher: IPasswordHasher;

  @Inject(injectTokenGenerator)
  private readonly tokenGenerator: ITokenGenerator;

  async execute(command: LoginCommand): Promise<AuthResultDto> {
    const { email, password, ipAddress, userAgent, deviceId } = command.props;

    // 1. Find User
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Find AuthIdentity
    const authIdentity =
      await this.authIdentityRepo.findByProviderAndProviderUserId(
        AuthProvider.LOCAL,
        email,
      );

    if (!authIdentity) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Verify Password
    const isValid = await authIdentity.verifyPassword(
      password,
      this.passwordHasher,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
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

    this.sessionRepo.persist(session);

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
      this.tokenGenerator.sign(payload),
      this.tokenGenerator.sign(payload),
    ]);

    // We rely on the repository implementation or an interceptor to publish these events
    // but typically we should ensure they are dispatched.
    // For now assuming the infrastructure handles event dispatching on persist or commit.

    const userDto = new UserResponseDto(
      user.id,
      user.email.value,
      user.tenantId,
    );

    // We only expose non-sensitive user data and expiration info in the body
    // Tokens are expected to be handled by the controller (cookies)
    // BUT the return type of Execute usually strictly matches the DTO.
    // LoginResponseDto defined earlier does NOT have tokens.
    // So we need to return something that holds tokens too, OR LoginResponseDto should have them
    // and the controller strips them out / moves them to cookies.
    // For cleanliness, let's return a Result object that includes tokens,
    // or modify LoginResponseDto to be the 'internal' response.
    // The requirement T038 says "NO tokens" in LoginResponseDto (user object, expiresAt...).
    // So the command handler needs to return { ...dto, accessToken, refreshToken }.
    // But properties on DTO validation?
    // I'll return a composite object and let the controller map it.

    // Changing return type to `any` or a specific internal interface temporarily
    // because `LoginResponseDto` doesn't have tokens.
    // Or I extend it.

    return new AuthResultDto({
      user: userDto,
      sessionId: session.id,
      expiresAt: session.expiresAt,
      refreshExpiresAt: session.expiresAt,
      accessToken,
      refreshToken,
    });
  }
}
