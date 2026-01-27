```bash
npm i -g @nestjs/cli
nest new <project-name> --package-manager pnpm
```


cài đặt neverthrow và uuid, @nestjs/event-emitter
```bash
cd <project-name>
pnpm i neverthrow uuid

```

cài đặt @nestjs/event-emitter
```bash

pnpm i @nestjs/event-emitter @nestjs/cqrs

```


Tạo thư mục ddd
```bash
# Core
mkdir -p src/core/ddd
mkdir -p src/core/ddd/domain-event.base.ts
mkdir -p src/core/ddd/entity.base.ts
mkdir -p src/core/ddd/aggregate-root.base.ts
mkdir -p src/core/ddd/command.base.ts
mkdir -p src/core/ddd/event.base.ts
mkdir -p src/core/ddd/value-object.base.ts

mkdir -p src/core/ddd/exceptions
mkdir -p src/core/ddd/exceptions/application.exception.ts
mkdir -p src/core/ddd/exceptions/domain.exception.ts

mkdir -p src/shared/constants
mkdir -p src/shared/constants/index.ts

mkdir -p src/shared/decorators
mkdir -p src/shared/decorators/index.ts

mkdir -p src/shared/utils
mkdir -p src/shared/utils/validation.ts
```

setup path 
```bash
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["src/shared/*"],
      "@core/*": ["src/core/*"]
    },
```