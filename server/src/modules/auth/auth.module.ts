import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { LoginHandler } from './application/commands/login.handler';
import { RefreshHandler } from './application/commands/refresh.handler';
import { RegisterHandler } from './application/commands/register.handler';
import { GetSessionHandler } from './application/queries/get-session.handler';
import { ValidateSessionHandler } from './application/queries/validate-session.handler';
import { AuthController } from './controllers/auth.controller';
import {
  passwordHasherToken,
  providePasswordHasher,
} from './domain/ports/password-hasher.interface';
import {
  provideTokenHasher,
  tokenHasherToken,
} from './domain/ports/token-hasher.interface';
import {
  provideTokenService,
  tokenServiceToken,
} from './domain/ports/token-service.interface';
import { provideTokenStrategies } from './domain/ports/token-strategy.interface';
import {
  provideUsernameAvailability,
  usernameAvailabilityToken,
} from './domain/ports/username-availability.interface';
import {
  provideUsernameGenerator,
  usernameGeneratorToken,
} from './domain/ports/username-generator.interface';
import { provideAuthIdentityRepository } from './domain/repositories/auth-identity.repository.interface';
import { provideLoginAttemptTrackerRepository } from './domain/repositories/login-attempt-tracker.repository.interface';
import { provideSessionRepository } from './domain/repositories/session.repository.interface';
import { provideTenantRepository } from './domain/repositories/tenant.repository.interface';
import { provideUserRepository } from './domain/repositories/user.repository.interface';
import { UsernameGeneratorService } from './domain/services/username-generator.service';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import {
  AuthIdentityMapper,
  TenantMapper,
  UserMapper,
} from './infrastructure/mappers';
import { LoginAttemptTrackerMapper } from './infrastructure/mappers/login-attempt-tracker.mapper';
import { SessionMapper } from './infrastructure/mappers/session.mapper';
import { AuthIdentityOrmEntity } from './infrastructure/persistence/auth-identity.orm-entity';
import { LoginAttemptTrackerOrmEntity } from './infrastructure/persistence/login-attempt-tracker.orm-entity';
import { SessionOrmEntity } from './infrastructure/persistence/session.orm-entity';
import { TenantOrmEntity } from './infrastructure/persistence/tenant.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import {
  AuthIdentityRepository,
  LoginAttemptTrackerRepository,
  SessionRepository,
  TenantRepository,
  UserRepository,
} from './infrastructure/repositories';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';
import { Sha256TokenHasherService } from './infrastructure/services/sha256-token-hasher.service';
import { AccessTokenStrategy } from './infrastructure/services/strategies/access-token.strategy';
import { RefreshTokenStrategy } from './infrastructure/services/strategies/refresh-token.strategy';
import { TokenService } from './infrastructure/services/token.service';
import { UserSessionCookie } from './infrastructure/services/user-session-cookie';
import { UsernameAvailabilityService } from './infrastructure/services/username-availability.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

const commandHandlers = [RegisterHandler, LoginHandler, RefreshHandler];
const queryHandlers = [GetSessionHandler, ValidateSessionHandler];
const mappers = [
  TenantMapper,
  UserMapper,
  AuthIdentityMapper,
  SessionMapper,
  LoginAttemptTrackerMapper,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    JwtModule.register({
      global: false,
    }),
    MikroOrmModule.forFeature([
      TenantOrmEntity,
      UserOrmEntity,
      AuthIdentityOrmEntity,
      SessionOrmEntity,
      LoginAttemptTrackerOrmEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,

    provideAuthIdentityRepository(AuthIdentityRepository),
    provideTenantRepository(TenantRepository),
    provideUserRepository(UserRepository),
    provideSessionRepository(SessionRepository),
    provideLoginAttemptTrackerRepository(LoginAttemptTrackerRepository),

    providePasswordHasher(BcryptPasswordHasher),
    provideTokenHasher(Sha256TokenHasherService),
    provideUsernameGenerator(UsernameGeneratorService),
    provideUsernameAvailability(UsernameAvailabilityService),
    ...provideTokenStrategies([RefreshTokenStrategy, AccessTokenStrategy]),
    provideTokenService(TokenService),
    UserSessionCookie,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    passwordHasherToken,
    usernameGeneratorToken,
    usernameAvailabilityToken,
    tokenServiceToken,
    tokenHasherToken,
  ],
})
export class AuthModule {}
