# Module Structure

> DDD module conventions, layer boundaries, and building blocks for **Easy English V2**.
>
> Reference: [domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon) — this project follows the same Hexagonal Architecture + DDD + CQRS approach described there.

---

## 1. Overview

Each server module represents a **bounded context** in the domain. Modules follow the Hexagonal Architecture (Ports & Adapters) pattern: the domain core is framework-agnostic, the application layer orchestrates use cases, infrastructure provides adapters for external systems, and controllers sit at the edge.

Dependencies always point **inward**:

```
Controllers → Application → Domain
Infrastructure → Application (implements ports)
```

The domain layer has **zero** external dependencies — no NestJS, no MikroORM.

---

## 2. Module Anatomy

Each module lives in `server/src/modules/<module-name>/` and is organized into four layers:

```
server/src/modules/<module-name>/
│
├── domain/                         # Pure domain — no framework imports
│   ├── entities/                   # Domain entities and aggregate roots
│   │   └── <name>.entity.ts
│   ├── value-objects/              # Immutable value types
│   │   └── <name>.vo.ts
│   ├── events/                     # Domain events (plain classes)
│   │   └── <name>.event.ts
│   ├── exceptions/                 # Domain-specific exceptions
│   │   └── <name>.exception.ts
│   └── services/                   # Domain services (multi-entity logic)
│       └── <name>.service.ts
│
├── application/                    # Use cases — commands, queries, orchestration
│   ├── commands/                   # Write operations
│   │   ├── <name>.command.ts
│   │   └── <name>.handler.ts
│   ├── queries/                    # Read operations
│   │   ├── <name>.query.ts
│   │   └── <name>.handler.ts
│   ├── repositories/               # Repository port interfaces (abstractions)
│   │   └── <name>.repository.interface.ts
│   └── ports/                      # Other infrastructure port interfaces
│       └── <name>.interface.ts
│
├── infrastructure/                 # Framework-specific implementations
│   ├── persistence/                # MikroORM ORM entities (DB schema)
│   │   └── <name>.orm-entity.ts
│   ├── mappers/                    # Domain ↔ persistence ↔ response mappers
│   │   └── <name>.mapper.ts
│   ├── repositories/               # Repository implementations (implements port)
│   │   └── <name>.repository.ts
│   └── services/                   # Infrastructure service implementations
│       └── <name>.service.ts
│
├── controllers/                    # HTTP entry points
│   └── <name>.controller.ts
│
├── dto/                            # Data Transfer Objects (API boundary)
│   ├── requests/
│   │   └── <name>.request.dto.ts
│   ├── responses/
│   │   └── <name>.response.dto.ts
│   └── validators/
│       └── <name>.validator.ts
│
└── <module-name>.module.ts         # NestJS module definition
```

### Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| Domain entity | `*.entity.ts` | `user.entity.ts` |
| Value object | `*.vo.ts` | `email.vo.ts` |
| Domain event | `*.event.ts` | `user-registered.event.ts` |
| Domain exception | `*.exception.ts` | `email-already-exists.exception.ts` |
| Repository interface | `*.repository.interface.ts` | `user.repository.interface.ts` |
| Port interface | `*.interface.ts` | `password-hasher.interface.ts` |
| ORM entity | `*.orm-entity.ts` | `user.orm-entity.ts` |
| Mapper | `*.mapper.ts` | `user.mapper.ts` |
| Repository impl | `*.repository.ts` (infra) | `user.repository.ts` |
| Command | `*.command.ts` | `register.command.ts` |
| Command handler | `*.handler.ts` | `register.handler.ts` |
| Query | `*.query.ts` | `get-session.query.ts` |
| Query handler | `*.handler.ts` | `get-session.handler.ts` |
| Request DTO | `*.request.dto.ts` | `login.request.dto.ts` |
| Response DTO | `*.response.dto.ts` | `user.response.dto.ts` |
| Controller | `*.controller.ts` | `auth.controller.ts` |

---

## 3. Domain Layer Building Blocks

### 3.1 Entity vs AggregateRoot

The project provides two base classes in `server/src/core/ddd/`:

| Base Class | Purpose | Events |
|-----------|---------|--------|
| `Entity` | Domain entity with identity and timestamps | None |
| `AggregateRoot` (extends `Entity`) | Consistency boundary, emits domain events | `addEvent()`, `publishEvents()` |

External references should always point to the **aggregate root**, never to internal child entities.

```typescript
// entity.base.ts — identity + equality
export abstract class Entity {
  protected _id!: AggregateID;          // UUID string
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  public equals(object?: Entity): boolean { ... }
  public updateUpdatedAt(): void { ... }
}

// aggregate-root.base.ts — adds domain event collection
export abstract class AggregateRoot extends Entity {
  private _domainEvents: DomainEvent[] = [];

  protected addEvent(event: DomainEvent): void { ... }
  publishEvents(logger: Logger, eventBus: EventBus): void { ... }
  clearEvents(): void { ... }
}
```

Use `AggregateRoot` for entities that are the root of a consistency boundary and need to emit events. Use `Entity` for child objects inside an aggregate that don't emit events directly.

### 3.2 Factory Methods: `create()` and `rehydrate()`

Every aggregate follows a two-factory pattern:

```typescript
export class User extends AggregateRoot {
  private constructor(props: CreateEntityProps<UserProps>) {
    super({ ...props });
    this.tenantId = props.tenantId;
    this.email = props.email;
    // ...
  }

  // New user — generates ID, emits domain events
  static create(props: Omit<UserProps, 'role'> & { role?: UserRole }): User {
    const id = v7();
    const user = new User({ id, ...props });
    user.addEvent(new UserRegisteredEvent({ aggregateId: user.id, ... }));
    return user;
  }

  // Existing user restored from DB — no events emitted
  static rehydrate(props: CreateEntityProps<UserProps>): User {
    return new User(props);
  }
}
```

| Method | When to use | Emits events? |
|--------|------------|---------------|
| `create()` | New entity — first time it enters the system | Yes |
| `rehydrate()` | Restoring from persistence — already existed | No |

### 3.3 Value Objects

Value objects are immutable, identity-less types that wrap primitives and enforce their own invariants. Base class: `ValueObject<T>` from `@core/ddd`.

```typescript
// domain/value-objects/email.vo.ts
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });      // calls checkIfEmpty
    this.validate({ value });
  }

  static create(value: string): Email {
    return new Email(value);
  }

  get value(): string {
    return this.props.value;
  }

  protected validate({ value }: { value: string }): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new ArgumentInvalidException('Invalid email format');
    }
  }
}
```

Rules:
- Always use a private constructor + static `create()` factory
- Validate in the constructor — invalid objects cannot be created
- Use `equals()` for structural comparison (provided by base class)
- Never expose mutable methods — return a new instance for changes

Prefer value objects over raw primitives for any domain concept: `Email`, `Username`, `WorkspaceId`, `CardRating`. This is the **domain primitives** pattern.

### 3.4 Domain Events

Domain events signal that something meaningful happened. They decouple aggregates and trigger async side effects.

```typescript
// domain/events/user-registered.event.ts
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly payload: {
      aggregateId: string;
      userId: string;
      email: string;
      tenantId: string;
      name: string;
    },
  ) {
    super({ aggregateId: payload.aggregateId });
  }
}

// In aggregate root — emit during create(), not rehydrate()
user.addEvent(new UserRegisteredEvent({ aggregateId: user.id, ... }));

// Repository publishes events after a successful save
await this.userRepository.save(user);
// → userRepository.save() calls user.publishEvents(logger, eventBus)
```

Rules:
- Events are added inside `create()` — never in `rehydrate()`
- Repositories are responsible for publishing events after the save succeeds
- Handlers are registered with `@EventsHandler` and should be async
- All event-triggered changes save in a single transaction

### 3.5 Domain Exceptions

Domain exceptions represent business rule violations — they are separate from HTTP exceptions:

```typescript
// domain/exceptions/email-already-exists.exception.ts
export class EmailAlreadyExistsException extends Error {
  constructor() {
    super('Email already exists');
  }
}
```

Controllers map domain exceptions to HTTP exceptions. Domain layers never throw `HttpException`.

### 3.6 Domain Services

Use a domain service when logic involves multiple entities and doesn't naturally belong to any single one:

```typescript
// domain/services/username-generator.service.ts
export class UsernameGeneratorService {
  generate(name: string): Username {
    const base = name.toLowerCase().replace(/\s+/g, '.');
    return Username.create(`${base}.${Math.floor(Math.random() * 9999)}`);
  }
}
```

Domain services operate only on domain types and have no framework dependencies.

---

## 4. Application Layer

### 4.1 Ports (Abstractions)

Ports are interfaces that abstract infrastructure dependencies. The application layer defines them; the infrastructure layer implements them. This is the **Dependency Inversion** principle.

**Repository ports** live in `application/repositories/`:

```typescript
// application/repositories/user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

**Service ports** live in `application/ports/`:

```typescript
// application/ports/password-hasher.interface.ts
export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashed: string): Promise<boolean>;
}

// Injection token helpers (see createInjection utility)
export const InjectPasswordHasher = inject;
export const passwordHasherToken = token;
export const providePasswordHasher = provider;
```

Handlers inject ports by token — never concrete classes:

```typescript
@CommandHandler(RegisterCommand)
export class RegisterHandler {
  constructor(
    @InjectUserRepository() private readonly userRepo: IUserRepository,
    @InjectPasswordHasher() private readonly hasher: IPasswordHasher,
  ) {}
}
```

### 4.2 Commands and Queries

See [CQRS Guidelines](./cqrs-guidelines.md) for full patterns. Quick reference:

```
application/
├── commands/
│   ├── register/
│   │   ├── register.command.ts   # Plain class, no methods
│   │   └── register.handler.ts   # @CommandHandler — load, mutate, save
│   └── login/
└── queries/
    └── get-session/
        ├── get-session.query.ts
        └── get-session.handler.ts  # @QueryHandler — read directly from DB
```

---

## 5. Infrastructure Layer

### 5.1 ORM Entities (Persistence Models)

ORM entities are **separate** from domain entities. They model the database schema and use MikroORM decorators. They are **never** used outside the infrastructure layer.

```typescript
// infrastructure/persistence/user.orm-entity.ts
@Entity({ tableName: 'user' })
export class UserOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => TenantOrmEntity)
  tenant!: TenantOrmEntity;

  @Property()
  email!: string;

  @Property()
  username!: string;

  @Property()
  name!: string;

  @Property()
  role!: string;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
```

Key principle: schema changes (column renames, denormalization) don't touch the domain entity — only the ORM entity and mapper change.

### 5.2 Mappers

Mappers translate between the three representations of data. Base interface: `Mapper<DomainEntity, DbRecord, Response>` from `@core/ddd`.

```typescript
// infrastructure/mappers/user.mapper.ts
@Injectable()
export class UserMapper implements Mapper<User, UserOrmEntity, UserOrmEntity> {
  constructor(private readonly em: EntityManager) {}

  // Domain → Persistence (for save/update)
  toPersistence(entity: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = entity.id;
    orm.tenant = this.em.getReference(TenantOrmEntity, entity.tenantId);
    orm.email = entity.email.value;      // unwrap value object
    orm.username = entity.username.value;
    orm.name = entity.name;
    orm.role = entity.role;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  // Persistence → Domain (for rehydration from DB)
  toDomain(record: UserOrmEntity): User {
    return User.rehydrate({
      id: record.id,
      tenantId: record.tenant.id,
      email: Email.create(record.email),        // reconstruct value objects
      username: Username.create(record.username),
      name: record.name,
      role: record.role as UserRole,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  // Domain → Response (for API responses)
  toResponse(entity: User): UserOrmEntity {
    return this.toPersistence(entity);
  }
}
```

The mapper is the **only** place that knows about both the domain model and the database schema. It is injected into repositories.

### 5.3 Repositories (Implementations)

Repositories implement the port interface from the application layer:

```typescript
// infrastructure/repositories/user.repository.ts
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: UserMapper,
  ) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.em.findOne(UserOrmEntity, { id });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async save(user: User): Promise<void> {
    const orm = this.mapper.toPersistence(user);
    await this.em.persistAndFlush(orm);
    // Publish domain events after successful persistence
    user.publishEvents(this.logger, this.eventBus);
  }
}
```

---

## 6. Module Dependency Rules

Modules can only depend on modules below them in the hierarchy:

```
auth ──────► workspace
             │
             ▼
        learning ◄──── flashcard
             │
             ▼
         dictionary
```

- `auth` has no dependencies on other modules
- `workspace` depends only on `auth`
- `learning` depends on `workspace` and `dictionary`
- `flashcard` depends on `learning/progress` (FSRS scheduling)
- `dictionary` is a leaf — no downstream dependencies

### Shared Kernel

Cross-cutting value objects and types live in `server/src/shared/`:

```
server/src/core/ddd/
├── entity.base.ts          # Entity base class
├── aggregate-root.base.ts  # AggregateRoot base class
├── value-object.base.ts    # ValueObject base class
├── domain-event.base.ts    # DomainEvent base class
├── mapper.base.ts          # Mapper interface
├── command.base.ts
└── query.base.ts
```

Modules import base classes from `@core/ddd` freely — it has zero business dependencies.

---

## 7. NestJS Module Wiring

```typescript
// auth.module.ts
@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([
      UserOrmEntity,
      SessionOrmEntity,
      TenantOrmEntity,
      AuthIdentityOrmEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    // Command handlers
    RegisterHandler,
    LoginHandler,
    RefreshHandler,
    // Query handlers
    GetSessionHandler,
    ValidateSessionHandler,
    // Mappers
    UserMapper,
    SessionMapper,
    TenantMapper,
    AuthIdentityMapper,
    // Repository implementations bound to port tokens
    provideUserRepository(),
    provideSessionRepository(),
    provideTenantRepository(),
    provideAuthIdentityRepository(),
    // Infrastructure service implementations bound to port tokens
    providePasswordHasher(),
    provideTokenService(),
    // Domain services
    UsernameGeneratorService,
  ],
})
export class AuthModule {}
```

The `provide*()` helpers bind the infrastructure class to the injection token defined in the port interface, keeping handlers decoupled from concrete implementations.

---

## 8. Module Boundaries Checklist

| Check | Rule |
|-------|------|
| Domain layer is pure | No `@Injectable()`, MikroORM, or NestJS decorators in domain entities/VOs |
| Ports are in application layer | Repository and service interfaces live in `application/repositories/` and `application/ports/` |
| Implementations are in infra | Concrete repos/services only in `infrastructure/` |
| Mappers own the translation | Only mappers translate between domain and ORM entities |
| No circular dependencies | Module A never imports Module B while B imports A |
| Events only in `create()` | `rehydrate()` never adds domain events |
| Repository publishes events | After `save()`, call `publishEvents()` on the aggregate |
| DTOs are presentation-only | Controllers transform entities → DTOs via mappers |
| No cross-aggregate object refs | Cross-boundary references use IDs, not entity instances |

---

## 9. Anti-Patterns to Avoid

| Anti-pattern | Problem | Fix |
|-------------|---------|-----|
| Anemic domain model | Business logic lives in services, not entities | Move validation and behavior into entities/VOs |
| ORM entity used as domain entity | Couples domain to persistence framework | Separate ORM entities; use mappers |
| Domain exceptions are HTTP exceptions | Couples domain to transport layer | Map to HTTP in controllers only |
| Commands returning domain objects | Violates CQS | Return only IDs or metadata |
| Handlers importing concrete repos | Bypasses DI and port abstraction | Inject by interface token |
| Rehydrate emitting events | Events fired twice if entity is re-saved | Events only in `create()` |

---

## 10. Real Module Examples

See domain documentation for full entity/event/repository details:

- [Auth Module](../domain/auth/README.md)
- [Workspace Module](../domain/workspace/README.md)
- [Flashcard Module](../domain/flashcard/README.md)
- [Learning Module](../domain/learning/README.md)
- [Dictionary Module](../domain/dictionary/README.md)

---

## 11. Related Documentation

- [CQRS Guidelines](./cqrs-guidelines.md) — Command/query patterns
- [Architecture Overview](./architecture-overview.md) — System diagram
- [Multi-Tenant Design](./multi-tenant-design.md) — Workspace isolation
- [domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon) — Reference architecture
