import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoginHandler } from './application/commands/login.handler';
import { RegisterHandler } from './application/commands/register.handler';
import { GetSessionHandler } from './application/queries/get-session.handler';
import { ValidateSessionHandler } from './application/queries/validate-session.handler';
import { AuthController } from './controllers/auth.controller';
import {
  passwordHasherProvider,
  passwordHasherToken,
} from './domain/ports/password-hasher.interface';
import {
  tokenGeneratorProvider,
  tokenGeneratorToken,
} from './domain/ports/token-generator.interface';
import {
  usernameAvailabilityServiceProvider,
  usernameAvailabilityServiceToken,
} from './domain/ports/username-availability.interface';
import {
  usernameGeneratorProvider,
  usernameGeneratorToken,
} from './domain/ports/username-generator.interface';
import { authIdentityRepositoryProvider } from './domain/repositories/auth-identity.repository.interface';
import { loginAttemptTrackerRepositoryProvider } from './domain/repositories/login-attempt-tracker.repository.interface';
import { sessionRepositoryProvider } from './domain/repositories/session.repository.interface';
import { tenantRepositoryProvider } from './domain/repositories/tenant.repository.interface';
import { userRepositoryProvider } from './domain/repositories/user.repository.interface';
import { UsernameGeneratorService } from './domain/services/username-generator.service';
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
import { TokenGeneratorService } from './infrastructure/services/token-generator.service';
import { UsernameAvailabilityService } from './infrastructure/services/username-availability.service';

const repositories = [
  TenantRepository,
  UserRepository,
  AuthIdentityRepository,
  SessionRepository,
  LoginAttemptTrackerRepository,
];
const commandHandlers = [RegisterHandler, LoginHandler];
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
    CqrsModule,

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
    ...repositories,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,

    authIdentityRepositoryProvider(AuthIdentityRepository),
    tenantRepositoryProvider(TenantRepository),
    userRepositoryProvider(UserRepository),
    sessionRepositoryProvider(SessionRepository),
    loginAttemptTrackerRepositoryProvider(LoginAttemptTrackerRepository),

    passwordHasherProvider(BcryptPasswordHasher),
    usernameGeneratorProvider(UsernameGeneratorService),
    usernameAvailabilityServiceProvider(UsernameAvailabilityService),
    tokenGeneratorProvider(TokenGeneratorService),
  ],
  exports: [
    passwordHasherToken,
    usernameGeneratorToken,
    usernameGeneratorToken,
    usernameAvailabilityServiceToken,
    tokenGeneratorToken,
  ],
})
export class AuthModule {}
