import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { appConfig, AppConfig, httpConfig, HttpConfig } from './configs';
import { GlobalExceptionFilter, ResponseInterceptor } from './core/api';
import { swagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const appConfigValues = app.get<AppConfig>(appConfig.KEY);
  // const cookieConfigValues = app.get<CookieConfig>(cookieConfig.KEY);
  const httpConfigValues = app.get<HttpConfig>(httpConfig.KEY);

  const port = appConfigValues.port;
  const domain = appConfigValues.domain;
  const isProduction = appConfigValues.isProduction;

  const globalPrefix = 'api';
  app.enableCors({
    origin: httpConfigValues.corsOrigins, // cho phép Angular gọi
    credentials: true, // nếu bạn gửi cookie/token
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.setGlobalPrefix(globalPrefix);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (httpConfigValues.versioningEnable) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: httpConfigValues.version,
      prefix: httpConfigValues.versioningPrefix,
    });
  }

  swagger(app, appConfigValues);

  await app.listen(port, isProduction ? '0.0.0.0' : '127.0.0.1');

  console.log(`Server in ${process.env.NODE_ENV} mode`);
  console.log(`Server is listening on :${port}/${globalPrefix}`);
  console.log(`Swagger: ${domain}/${globalPrefix}/docs`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
