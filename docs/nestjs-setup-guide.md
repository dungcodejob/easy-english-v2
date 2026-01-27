# Hướng Dẫn Tạo NestJS Project Mới Từ Đầu

Tài liệu này hướng dẫn chi tiết các bước để khởi tạo một dự án NestJS mới với cấu trúc và cấu hình giống dự án Easy English Server.

---

## Mục Lục

- [1. Yêu Cầu Hệ Thống](#1-yêu-cầu-hệ-thống)
- [2. Khởi Tạo Project](#2-khởi-tạo-project)
- [3. Cài Đặt Dependencies](#3-cài-đặt-dependencies)
- [4. Cấu Hình TypeScript](#4-cấu-hình-typescript)
- [5. Tạo Cấu Trúc Thư Mục](#5-tạo-cấu-trúc-thư-mục)
- [6. Cấu Hình Environment](#6-cấu-hình-environment)
- [7. Cấu Hình Configs](#7-cấu-hình-configs)
- [8. Cấu Hình Database (MikroORM)](#8-cấu-hình-database-mikroorm)
- [9. Setup Shared Modules](#9-setup-shared-modules)
- [10. Cấu Hình App Module](#10-cấu-hình-app-module)
- [11. Cấu Hình Main Entry](#11-cấu-hình-main-entry)
- [12. Cấu Hình Scripts](#12-cấu-hình-scripts)
- [13. Chạy Project](#13-chạy-project)

---

## 1. Yêu Cầu Hệ Thống

| Phần mềm   | Phiên bản | Ghi chú         |
| ---------- | --------- | --------------- |
| Node.js    | ≥ 24.x    | Khuyến nghị LTS |
| pnpm       | ≥ 10.x    | Đi kèm Node.js  |
| PostgreSQL | ≥ 17.x    | Database chính  |
| Nest CLI   | ≥ 11.x    | Tạo project     |

### Cài đặt Nest CLI global:

```bash
npm install -g @nestjs/cli
```

---

## 2. Khởi Tạo Project

### Tạo project mới:

```bash
npm i -g @nestjs/cli
nest new <project-name> --package-manager pnpm
```

Chọn các options:

- Package manager: **npm** (hoặc bun/pnpm tùy thích)

### Cấu trúc mặc định sau khi tạo:

```
my-project/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 3. Cài Đặt Dependencies

### Core Dependencies:

```bash
npm install @nestjs/config @nestjs/swagger @nestjs/terminus @nestjs/cache-manager @nestjs/throttler @nestjs/axios @nestjs/jwt @nestjs/passport
```

### MikroORM (Database):

```bash
npm install @mikro-orm/core @mikro-orm/cli @mikro-orm/nestjs @mikro-orm/postgresql @mikro-orm/migrations @mikro-orm/seeder @mikro-orm/sql-highlighter
```

### Utilities:

```bash
npm install class-validator class-transformer bcrypt cookie-parser helmet passport-jwt reflect-metadata rxjs uuid date-fns slugify neverthrow
```

### Dev Dependencies:

```bash
npm install -D @types/bcrypt @types/cookie-parser @types/passport-jwt @types/express @types/node husky prettier eslint-config-prettier eslint-plugin-prettier
```

---

## 4. Cấu Hình TypeScript

Thay thế nội dung `tsconfig.json` để hỗ trợ path aliases:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@app/core": ["src/core"],
      "@app/core/*": ["src/core/*"],
      "@app/shared": ["src/shared"],
      "@app/shared/*": ["src/shared/*"],
      "@app/modules": ["src/modules"],
      "@app/modules/*": ["src/modules/*"]
    },
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false
  },
  "exclude": ["node_modules", "dist"]
}
```

---

## 5. Tạo Cấu Trúc Thư Mục

Tạo cấu trúc thư mục theo pattern sau:

```bash
# Core
mkdir -p src/core/configs
mkdir -p src/core/database/repositories
mkdir -p src/core/database/migrations
mkdir -p src/core/database/seeders

# Shared
mkdir -p src/shared/constants
mkdir -p src/shared/decorators
mkdir -p src/shared/errors
mkdir -p src/shared/filters
mkdir -p src/shared/interceptors
mkdir -p src/shared/middlewares
mkdir -p src/shared/models
mkdir -p src/shared/services
mkdir -p src/shared/utils

# Core Health
mkdir -p src/core/health

# Modules
mkdir -p src/modules/user
```

### Cấu trúc cuối cùng:

```
src/
├── core/
│   ├── configs/          # App, DB, JWT configs
│   ├── health/           # Health check module
│   └── database/
│       ├── repositories/ # Repositories
│       ├── migrations/   # Database migrations
│       └── seeders/      # Database seeders
├── shared/
│   ├── constants/        # Enums, ENV keys
│   ├── decorators/       # Custom decorators
│   ├── errors/           # Custom exceptions
│   ├── filters/          # Exception filters
│   ├── interceptors/     # Response interceptors
│   ├── middlewares/      # HTTP middlewares
│   ├── models/           # DTOs, Result types
│   ├── services/         # Shared services
│   └── utils/            # Helper functions
├── modules/
│   └── user/             # User module
├── app.module.ts
└── main.ts
```

---

## 6. Cấu Hình Environment

### Tạo file `.env.dev`:

```env
NODE_ENV=dev

# App Config
APP_HOST=localhost
APP_PORT=3000
APP_CLIENT_DOMAIN=http://localhost:4200
APP_SCHEME=http
APP_ID=app_id

# HTTP Versioning
HTTP_VERSION=1
HTTP_VERSIONING_ENABLE=true

# CORS
CORS_ORIGINS=http://localhost:4200

# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/your_database

# Cookie Config
COOKIE_REFRESH_NAME='cookie_refresh_name'
COOKIE_SECRET='your_cookie_secret_key'

# JWT Config
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret
JWT_ACCESS_TOKEN_EXPIRED=60000
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_REFRESH_TOKEN_EXPIRED=3600000

# Throttler Config
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Tạo file `.env.prod` tương tự với values production.

---

## 7. Cấu Hình Configs

### 7.1. Tạo `src/shared/constants/env-key.ts`:

```typescript
export const ENV_KEY = {
  DATABASE_URL: 'DATABASE_URL',
  CORS_ORIGINS: 'CORS_ORIGINS',
} as const;
```

### 7.2. Tạo `src/core/configs/app.config.ts`:

```typescript
import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  const scheme = process.env.APP_SCHEME || 'http';
  const host = process.env.APP_HOST || 'localhost';
  const port = Number(process.env.APP_PORT) || 3000;

  return {
    testing: process.env.NODE_ENV === 'dev',
    appId: process.env.APP_ID || 'app_id',
    client: process.env.APP_CLIENT_DOMAIN || 'http://localhost:4200',
    host,
    port,
    scheme,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:4200',
    ],
    get domain() {
      return `${scheme}://${host}:${port}`;
    },
  };
});

export type AppConfig = ConfigType<typeof appConfig>;
export const InjectAppConfig = () => Inject(appConfig.KEY);
```

### 7.3. Tạo `src/core/configs/jwt.config.ts`:

```typescript
import { registerAs, ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export const jwtConfig = registerAs('jwt', () => ({
  accessToken: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'accessSecret',
    expiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRED) || 60000,
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refreshSecret',
    expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRED) || 3600000,
  },
}));

export type JwtConfig = ConfigType<typeof jwtConfig>;
export const InjectJwtConfig = () => Inject(jwtConfig.KEY);
```

### 7.4. Tạo `src/core/configs/cookie.config.ts`:

```typescript
import { registerAs, ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export const cookieConfig = registerAs('cookie', () => ({
  refreshName: process.env.COOKIE_REFRESH_NAME || 'refresh_token',
  secret: process.env.COOKIE_SECRET || 'cookie_secret',
}));

export type CookieConfig = ConfigType<typeof cookieConfig>;
export const InjectCookieConfig = () => Inject(cookieConfig.KEY);
```

### 7.5. Tạo `src/core/configs/http.config.ts`:

```typescript
import { registerAs, ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export const httpConfig = registerAs('http', () => ({
  version: process.env.HTTP_VERSION || '1',
  versioningEnable: process.env.HTTP_VERSIONING_ENABLE === 'true',
  versioningPrefix: 'v',
}));

export type HttpConfig = ConfigType<typeof httpConfig>;
export const InjectHttpConfig = () => Inject(httpConfig.KEY);
```

### 7.6. Tạo `src/core/configs/index.ts`:

```typescript
export * from './app.config';
export * from './jwt.config';
export * from './cookie.config';
export * from './http.config';
export * from './database.config';
```

---

## 8. Cấu Hình Database (MikroORM)

### Tạo `src/core/configs/database.config.ts`:

```typescript
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver, defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import * as dotenv from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${NODE_ENV}` });

export const databaseConfig = defineConfig({
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  entities: ['dist/core/database/entities/**/*.entity.js'],
  entitiesTs: ['src/core/database/entities/**/*.entity.ts'],
  debug: false,
  highlighter: new SqlHighlighter(),
  extensions: [Migrator, SeedManager],

  migrations: {
    path: 'dist/core/database/migrations',
    pathTs: 'src/core/database/migrations',
  },
  seeder: {
    path: 'dist/core/database/seeders',
    pathTs: 'src/core/database/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
  },
});

export default databaseConfig;
```

---

## 9. Setup Shared Modules

### 9.1. Tạo Exception Filter `src/shared/filters/http-exception.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 9.2. Tạo Transform Interceptor `src/shared/interceptors/transform.interceptor.ts`:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode: context.switchToHttp().getResponse().statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### 9.3. Tạo Health Module:

```bash
nest generate module core/health
nest generate controller core/health --no-spec
```

`src/core/health/health.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

---

## 10. Cấu Hình App Module

Thay thế `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';

import {
  appConfig,
  cookieConfig,
  jwtConfig,
  httpConfig,
  databaseConfig,
} from '@app/configs';
import { HttpExceptionFilter } from '@app/filters/http-exception.filter';
import { TransformInterceptor } from '@app/interceptors/transform.interceptor';
import { HealthModule } from './core/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, cookieConfig, jwtConfig, httpConfig],
      envFilePath: `./.env.${process.env.NODE_ENV || 'dev'}`,
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => databaseConfig,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
    }),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
```

---

## 11. Cấu Hình Main Entry

Thay thế `src/main.ts`:

```typescript
import { HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import {
  appConfig,
  AppConfig,
  cookieConfig,
  CookieConfig,
  httpConfig,
  HttpConfig,
} from '@app/configs';

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

bootstrap();
```

---

## 12. Cấu Hình Scripts

Thêm vào `package.json`:

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "migration:create": "mikro-orm migration:create --config ./src/core/configs/database.config.ts",
    "migration:up": "mikro-orm migration:up --config ./src/core/configs/database.config.ts",
    "migration:down": "mikro-orm migration:down --config ./src/core/configs/database.config.ts",
    "seed:run": "mikro-orm seeder:run --config ./src/core/configs/database.config.ts"
  }
}
```

---

## 13. Chạy Project

### Tạo database:

```bash
psql -U postgres -c "CREATE DATABASE your_database;"
```

### Chạy migrations (nếu có):

```bash
npm run migration:up
```

### Khởi động development server:

```bash
npm run start:dev
```

### Kiểm tra:

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/v1/health

---

## Checklist Setup Hoàn Tất

- [ ] Cài đặt Nest CLI
- [ ] Tạo project với `nest new`
- [ ] Cài đặt tất cả dependencies
- [ ] Cấu hình `tsconfig.json` với path aliases
- [ ] Tạo cấu trúc thư mục `core/`, `shared/`, `modules/`
- [ ] Tạo file `.env.dev` và `.env.prod`
- [ ] Tạo các config files (app, jwt, cookie, http, database)
- [ ] Setup Exception Filter và Transform Interceptor
- [ ] Cấu hình `app.module.ts`
- [ ] Cấu hình `main.ts` với Swagger, CORS, Helmet
- [ ] Tạo database PostgreSQL
- [ ] Chạy `npm run start:dev` thành công

---

> [!TIP]
> Sau khi hoàn tất setup cơ bản, bạn có thể tiếp tục thêm:
>
> - Authentication Module (JWT + Passport)
> - User Module
> - Custom Decorators (@CurrentUser, @Public)
> - Request Context với AsyncLocalStorage
