import { HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import {
  appConfig,
  AppConfig,
  cookieConfig,
  CookieConfig,
  httpConfig,
  HttpConfig,
} from '@app/configs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfigValues = app.get<AppConfig>(appConfig.KEY);
  const cookieConfigValues = app.get<CookieConfig>(cookieConfig.KEY);
  const httpConfigValues = app.get<HttpConfig>(httpConfig.KEY);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: appConfigValues.corsOrigins,
    credentials: true,
  });

  // Security
  app.use(cookieParser(cookieConfigValues.secret));
  app.use(helmet());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  // API Versioning
  if (httpConfigValues.versioningEnable) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: httpConfigValues.version,
      prefix: httpConfigValues.versioningPrefix,
    });
  }

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  await app.listen(appConfigValues.port);

  console.log(`Server running on: ${appConfigValues.domain}/api`);
  console.log(`Swagger: ${appConfigValues.domain}/api/docs`);
}

void bootstrap();
