import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterHandler } from './application/commands/register.handler';
import { AuthController } from './controllers/auth.controller';
import { IPasswordHasher } from './domain/ports/password-hasher.interface';
import { UsernameGeneratorService } from './domain/services/username-generator.service';
import {
  AuthIdentityRepository,
  TenantRepository,
  UserRepository,
} from './infrastructure/repositories';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';

const repositories = [TenantRepository, UserRepository, AuthIdentityRepository];
const commandHandlers = [RegisterHandler];

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [
    ...repositories,
    ...commandHandlers,
    UsernameGeneratorService,
    {
      provide: IPasswordHasher,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [IPasswordHasher],
})
export class AuthModule {}
