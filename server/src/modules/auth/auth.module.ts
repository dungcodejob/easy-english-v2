import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';

import { AccountMikroEntity } from './infrastructure/persistence/account.mikro-entity';
import { SessionMikroEntity } from './infrastructure/persistence/session.mikro-entity';
import { TenantMikroEntity } from './infrastructure/persistence/tenant.mikro-entity';
import { UserMikroEntity } from './infrastructure/persistence/user.mikro-entity';

import { AccountRepository } from './infrastructure/repositories/account.repository';
import { SessionRepository } from './infrastructure/repositories/session.repository';
import { TenantRepository } from './infrastructure/repositories/tenant.repository';
import { UserRepository } from './infrastructure/repositories/user.repository';

import { PasswordService } from '../../core/security/password.service';
import { LoginHandler } from './application/commands/login.handler';
import { RegisterHandler } from './application/commands/register.handler';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      UserMikroEntity,
      AccountMikroEntity,
      SessionMikroEntity,
      TenantMikroEntity,
    ]),
    PassportModule,
    CqrsModule,
  ],
  controllers: [AuthController],
  providers: [
    PasswordService,
    JwtStrategy,
    RegisterHandler,
    LoginHandler,
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IAccountRepository', useClass: AccountRepository },
    { provide: 'ISessionRepository', useClass: SessionRepository },
    { provide: 'ITenantRepository', useClass: TenantRepository },
  ],
  exports: [
    PasswordService,
    'IUserRepository',
    'IAccountRepository',
    'ISessionRepository',
    'ITenantRepository',
  ],
})
export class AuthModule {}
