# NestJS Backend Setup Guide

**Purpose**: Initialize and run a NestJS backend project from scratch.
**Time required**: ~15 minutes

---

## 1. Introduction

### What This Project Is

This guide walks you through setting up a NestJS backend from zero. NestJS is a TypeScript framework for building server-side applications with a modular architecture.

### What You'll Achieve

By the end of this guide, you will:
- Have a running NestJS application
- Understand the project structure
- Know how to add new features

---

## 2. Prerequisites

### Required Software

| Software | Version | Check Command |
|----------|---------|---------------|
| Node.js | 24.x | `node --version` |
| pnpm | 11.x | `pnpm --version` |

### Install Node.js

```bash
# Using nvm (recommended)
nvm install 24
nvm use 24
```

### Install pnpm

```bash
npm install -g pnpm
```

### Optional Tools

- **Docker**: For running PostgreSQL locally
- **DBeaver/pgAdmin**: Database client
- **Postman/Insomnia**: API testing

---

## 3. Initialize NestJS Project

### Step 1: Install NestJS CLI

```bash
pnpm add -g @nestjs/cli
```

Verify installation:
```bash
nest --version
```

### Step 2: Create New Project

```bash
nest new server
```

CLI will ask:
```
? Which package manager would you ❤️ to use?
> pnpm
  npm
  yarn
```

Select `pnpm` and wait for installation.

### Step 3: Navigate to Project

```bash
cd server
```

### Important CLI Options

| Option | Purpose | Example |
|--------|---------|---------|
| `--skip-git` | Don't initialize git | `nest new app --skip-git` |
| `--skip-install` | Don't install dependencies | `nest new app --skip-install` |
| `--package-manager` | Specify package manager | `nest new app --package-manager pnpm` |

---

## 4. Project Structure Overview

After creation, your project looks like this:

```
server/
├── src/
│   ├── main.ts              ← Application entry point
│   ├── app.module.ts        ← Root module
│   ├── app.controller.ts    ← Sample controller
│   ├── app.service.ts       ← Sample service
│   └── app.controller.spec.ts ← Sample test
├── test/                    ← E2E tests
├── node_modules/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

server/
├── src/
│   ├── main.ts
│   ├── app.module.ts        ← Root module
│   ├── app.controller.ts    ← Sample controller
│   ├── app.service.ts       ← Sample service
│   └── app.controller.spec.ts ← Sample test
│   ├── swagger.ts
│   │
│   ├── core/                    # Platform infrastructure
│   │   ├── configs/
│   │   ├── database/
│   │   │   ├── mikro-orm.ts
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   ├── cli/
│   │   ├── logging/
│   │   └── security/
│   │
│   ├── shared/                  # Cross-domain shared logic
│   │   ├── errors/
│   │   ├── pagination/
│   │   ├── filters/
│   │   ├── sort/
│   │   ├── base/
│   │   └── utils/
│   │
│   ├── modules/                 # DDD boundaries (MOST IMPORTANT)
│   │   ├── word/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   ├── queries/
│   │   │   │   └── handlers/
│   │   │   ├── infrastructure/
│   │   │   │   ├── orm/
│   │   │   │   └── repositories/
│   │   │   └── presentation/
│   │   │       └── controllers/
│   │   └── user/
│   │       └── ...
│   │
│   └── platform.ts              # (optional) platform bootstrap
│
├── .env.dev
├── .env.prod
└── package.json




### Key Files Explained

| File | Purpose |
|------|---------|
| `main.ts` | Bootstraps the application, starts the server |
| `app.module.ts` | Root module that imports all other modules |
| `app.controller.ts` | Handles HTTP requests, defines routes |
| `app.service.ts` | Contains business logic |
| `nest-cli.json` | NestJS CLI configuration |

---

## 5. Environment Configuration

### Step 1: Install Config Package

```bash
pnpm add @nestjs/config
```

### Step 2: Create .env File

Create `.env` in project root:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (if using)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=myapp
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Security
JWT_SECRET=your-secret-key-at-least-32-characters
```

### Step 3: Create .env.example

Copy `.env` to `.env.example` and remove sensitive values:

```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
JWT_SECRET=
```

### Step 4: Add .env to .gitignore

```bash
echo ".env" >> .gitignore
```

### Step 5: Enable Config Module

Update `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Available everywhere
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 6. Application Bootstrap

### Understanding main.ts

The default `main.ts` looks like:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### Enhanced main.ts with Common Setup

Replace with this production-ready version:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix: /api/...
  app.setGlobalPrefix('api');

  // Validation pipe: validate DTOs automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,            // Auto-transform types
    }),
  );

  // CORS: allow frontend requests
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3001'),
    credentials: true,
  });

  // Start server
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 API available at: http://localhost:${port}/api`);
}
bootstrap();
```

### Install Required Packages

```bash
pnpm add class-validator class-transformer
```

---

## 7. Running the Project

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Run in Development Mode

```bash
pnpm run start:dev
```

This enables hot-reload: changes auto-restart the server.

### Step 3: Verify It's Running

Open browser or run:

```bash
curl http://localhost:3000/api
```

Expected response:
```
Hello World!
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run start:dev` | Start in development mode with hot-reload |
| `pnpm run start:debug` | Start in debug mode |
| `pnpm run start:prod` | Start in production mode |
| `pnpm run build` | Build the project |
| `pnpm run lint` | Run ESLint |
| `pnpm run format` | Format code with Prettier |
| `pnpm run test` | Run unit tests |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run test:cov` | Run tests with coverage |
| `pnpm run test:e2e` | Run end-to-end tests |
| `pnpm run migration:create` | Create a new migration |
| `pnpm run migration:up` | Run pending migrations |
| `pnpm run migration:down` | Rollback last migration |
| `pnpm run migration:fresh` | Drop all tables and re-run migrations |
| `pnpm run schema:drop` | Drop all database tables |
| `pnpm run seed:run` | Run database seeders |
| `pnpm run seed:create` | Create a new seeder |
| `pnpm run cli` | Run CLI commands |

---

## 8. Swagger Configuration

### Install Swagger Package

```bash
pnpm add @nestjs/swagger
```

### Create `src/swagger.ts`

```typescript
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Easy English API')
    .setDescription('API documentation for Easy English platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
    })
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Words', 'Vocabulary management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Easy English API Docs',
  });
}
```

### Update `main.ts`

Add Swagger setup after creating the app:

```typescript
import { setupSwagger } from './swagger';

// ... inside bootstrap()
if (configService.get('SWAGGER_ENABLED') === 'true') {
  setupSwagger(app);
  console.log(`📖 Swagger available at: http://localhost:${port}/api/docs`);
}
```

### Swagger Features

| Feature | Description |
|---------|-------------|
| JWT Bearer Auth | `@ApiBearerAuth('access-token')` on protected endpoints |
| Cookie Auth | Refresh token authentication |
| API Tags | Group endpoints by module |
| Persist Auth | Token persists across page refresh |

### Access Swagger

| Environment | URL |
|-------------|-----|
| Development | http://localhost:3000/api/docs |
| Production | Disabled by default |

---

## 9. Common Issues

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find the process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Missing Environment Variables

**Error**: `Cannot read property 'get' of undefined`

**Solution**:
- Check `.env` file exists
- Check `ConfigModule.forRoot()` is imported

### Node Version Mismatch

**Error**: `The engine "node" is incompatible`

**Solution**:
```bash
nvm use 24
```

### Module Not Found

**Error**: `Cannot find module '@nestjs/config'`

**Solution**:
```bash
pnpm install
```

### Validation Not Working

**Error**: DTOs not validating

**Solution**:
- Check `class-validator` is installed
- Check `ValidationPipe` is added in `main.ts`
- Check DTO has decorators

---

## 10. Next Steps

### Adding a New Module

```bash
nest generate module users
# Creates: src/users/users.module.ts
```

### Adding a Controller

```bash
nest generate controller users
# Creates: src/users/users.controller.ts
```

### Adding a Service

```bash
nest generate service users
# Creates: src/users/users.service.ts
```

### All-in-One Resource

```bash
nest generate resource users
# Creates: module, controller, service, DTOs
```

### Project Structure After Adding Users

```
src/
├── main.ts
├── app.module.ts
└── users/
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.service.ts
    └── dto/
        ├── create-user.dto.ts
        └── update-user.dto.ts
```

---

## Quick Commands Reference

```bash
# Create project
nest new my-app --package-manager pnpm

# Run development
pnpm run start:dev

# Generate module
nest g module <name>

# Generate controller
nest g controller <name>

# Generate service
nest g service <name>

# Generate full resource
nest g resource <name>

# Run tests
pnpm run test

# Build for production
pnpm run build
```

---

**Next**: Check [Backend Project Setup Guide](./setup/backend-setup.md) for project-specific configuration and architectural patterns.
