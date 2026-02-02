import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './configs/mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // ConfigModule.forRoot({
    //   load: [appConfig, cookieConfig, jwtConfig, httpConfig],
    //   envFilePath: `./.env.${process.env.NODE_ENV || 'dev'}`,
    //   isGlobal: true,
    // }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => databaseConfig,
    }),
    CqrsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
