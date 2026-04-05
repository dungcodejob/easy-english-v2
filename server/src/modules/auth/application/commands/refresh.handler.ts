import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/core';

import { RefreshCommand } from './refresh.command';
import { InvalidRefreshTokenException } from '../../domain/exceptions/email-already-exists.exception';
import {
  type ITokenPayload,
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
  type ISessionRepository,
  InjectSessionRepository,
} from '../../domain/repositories/session.repository.interface';
import {
  type IUserRepository,
  InjectUserRepository,
} from '../../domain/repositories/user.repository.interface';
import { AuthResultDto } from '../../dto/auth-result.dto';
import { UserResponseDto } from '../../dto/responses/user.response.dto';

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<
  RefreshCommand,
  AuthResultDto
> {
  private readonly logger = new Logger(RefreshHandler.name);

  @InjectUserRepository()
  private readonly userRepo: IUserRepository;

  @InjectSessionRepository()
  private readonly sessionRepo: ISessionRepository;

  @InjectTokenHasher()
  private readonly tokenHasher: ITokenHasher;

  @InjectTokenService()
  private readonly tokenService: ITokenService;

  constructor(
    private readonly em: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RefreshCommand): Promise<AuthResultDto> {
    const { refreshToken } = command.props;

    if (!refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    let payload: ITokenPayload;

    try {
      payload = await this.tokenService.verify(TokenType.REFRESH, refreshToken);
    } catch {
      throw new InvalidRefreshTokenException();
    }

    const refreshTokenHash = await this.tokenHasher.hash(refreshToken);

    const activeSessions = await this.sessionRepo.findActiveByUserId(
      payload.userId,
    );

    const session = activeSessions.find(
      (s) => s.refreshTokenHash === refreshTokenHash,
    );

    if (!session) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepo.findByEmail(payload.email);

    if (!user) {
      throw new InvalidRefreshTokenException();
    }

    // Token rotation
    const newPayload: ITokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email.value,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.tokenService.sign(TokenType.ACCESS, newPayload),
      this.tokenService.sign(TokenType.REFRESH, newPayload),
    ]);

    const newRefreshTokenHash = await this.tokenHasher.hash(newRefreshToken);

    // Extend session expiration
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    session.setRefreshTokenHash(newRefreshTokenHash);

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
        token: newAccessToken,
        expiresAt: session.expiresAt,
      },
      refreshToken: {
        token: newRefreshToken,
        expiresAt: session.expiresAt,
      },
    });
  }
}
