import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IPasswordHasher } from './domain/ports/password-hasher.interface';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [
    {
      provide: IPasswordHasher,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [IPasswordHasher],
})
export class AuthModule {}
