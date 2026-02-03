import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterHandler } from './application/commands/register.handler';
import { AuthController } from './controllers/auth.controller';
import {
  passwordHasherProvider,
  passwordHasherToken,
} from './domain/ports/password-hasher.interface';
import {
  usernameAvailabilityServiceProvider,
  usernameAvailabilityServiceToken,
} from './domain/ports/username-availability.interface';
import {
  usernameGeneratorProvider,
  usernameGeneratorToken,
} from './domain/ports/username-generator.interface';
import { UsernameGeneratorService } from './domain/services/username-generator.service';
import {
  AuthIdentityMapper,
  TenantMapper,
  UserMapper,
} from './infrastructure/mappers';
import { AuthIdentityOrmEntity } from './infrastructure/persistence/auth-identity.orm-entity';
import { TenantOrmEntity } from './infrastructure/persistence/tenant.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import {
  AuthIdentityRepository,
  TenantRepository,
  UserRepository,
} from './infrastructure/repositories';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';
import { UsernameAvailabilityService } from './infrastructure/services/username-availability.service';

const repositories = [TenantRepository, UserRepository, AuthIdentityRepository];
const commandHandlers = [RegisterHandler];
const mappers = [TenantMapper, UserMapper, AuthIdentityMapper];

@Module({
  imports: [
    CqrsModule,

    MikroOrmModule.forFeature([
      TenantOrmEntity,
      UserOrmEntity,
      AuthIdentityOrmEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    ...repositories,
    ...commandHandlers,
    ...mappers,

    passwordHasherProvider(BcryptPasswordHasher),
    usernameGeneratorProvider(UsernameGeneratorService),
    usernameAvailabilityServiceProvider(UsernameAvailabilityService),
  ],
  exports: [
    passwordHasherToken,
    usernameGeneratorToken,
    usernameAvailabilityServiceToken,
  ],
})
export class AuthModule {}
