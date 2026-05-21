# Domain Documentation Guidelines

> Standards for writing domain documentation in **Easy English V2**.
> Reference architecture: [domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon)

---

## 1. Purpose & Scope

**This guideline covers:**
- Writing `docs/domain/<module>/README.md` for each bounded context
- Documenting entities, value objects, aggregates, domain rules, events, and repository interfaces
- Enforcing consistent ubiquitous language across code and docs
- Domain testing strategy for each building block

**This guideline does NOT cover:**
- API endpoint documentation → see `docs/api/`
- Application layer (commands/queries) patterns → see `docs/architecture/cqrs-guidelines.md`
- Infrastructure / ORM setup → see `docs/architecture/module-structure.md`

---

## 2. Writing Principles

1. **Use ubiquitous language** — every term must match exactly what is in the code (class names, method names, event names). Never invent synonyms.
2. **Tables over paragraphs** — use tables for lists of entities, VOs, events, rules. Reserve prose for non-obvious decisions only.
3. **Bullet points over walls of text** — if you need more than 3 lines to explain something, split into bullets.
4. **Code examples for non-obvious patterns** — if a rule is enforced in a non-standard way, show a 3-5 line snippet.
5. **State WHERE rules are enforced** — "email must contain @" is incomplete. "enforced in `Email.validate()`" is correct.
6. **Link to source files** — every entity, VO, event must link to its file (relative path from repo root).
7. **Document constraints, not implementations** — domain docs describe WHAT the rule is, not HOW the database stores it.
8. **Keep it current** — when you rename an entity or add an event in code, update the doc in the same PR.
9. **No HTTP/DB/framework vocabulary** — avoid "returns 404", "INSERT INTO", `@Entity()`, "MikroORM", "NestJS" in domain sections.
10. **One doc per bounded context** — don't put flashcard rules inside the learning doc just because they interact.
11. **Document the WHY** — for non-obvious design decisions, add a "Design Decisions" section explaining reasoning, not just the outcome.

---

## 3. Ubiquitous Language Rules

### Glossary table format

Every domain README must open with a glossary:

| Term | Definition | Code Symbol |
|------|-----------|-------------|
| Flashcard | A two-sided card with a front (question) and back (answer) owned by a workspace | `Flashcard` (`flashcard.aggregate.ts`) |
| Review Log | An immutable record of one review event | `ReviewLog` (`review-log.entity.ts`) |
| Card State | The FSRS learning state (New / Learning / Review / Relearning) | `CardState` VO |

### Rules

- **Term → Code match**: if the domain calls it "Study Session", the entity is `StudySession`, the event is `StudySessionStartedEvent`, the command is `StartStudySessionCommand`. No aliases.
- **Business language wins**: if product says "Deck", the aggregate is `Deck` — not `CardGroup`, not `FlashcardSet`.
- **Stable terms**: don't rename a term in docs without renaming it everywhere in code simultaneously.

### Red flags

- Database column name appears in a domain description (`tenant_id`, `created_at`)
- HTTP status code appears in a domain rule ("returns 404 if not found")
- Infrastructure type appears (`MikroORM`, `@Entity()`, `EntityManager`)
- Two docs use different terms for the same concept ("Session" vs "StudySession")

---

## 4. Bounded Contexts

A **bounded context** is a module with its own ubiquitous language, its own entities, and a clear ownership boundary. In this codebase, each folder under `server/src/modules/` is one bounded context.

### What to document per context

| Item | Description | Example |
|------|-------------|---------|
| **Owns** | Aggregates and entities this context is the source of truth for | `flashcard` owns `Flashcard`, `ReviewLog` |
| **Does NOT own** | Concepts it reads from other contexts (by ID only) | `flashcard` reads `workspaceId` — it does not own `Workspace` |
| **Depends on** | Other contexts it calls or listens to | `learning/study` depends on `flashcard` (reads cards) |
| **Publishes** | Domain events this context emits | `FlashcardCreatedEvent` |
| **Subscribes to** | Events from other contexts it reacts to | `learning/progress` subscribes to `CardReviewedEvent` |

### Rules

- One context = one module = one `docs/domain/<module>/README.md`
- A context owns a concept if it is the **only** place allowed to mutate it
- If two modules both mutate the same entity — that's a boundary violation
- Context map for this project: `auth` → `workspace` → `learning` ← `flashcard` → `dictionary`

### Red flags

- Module A imports a domain entity class from Module B (use IDs, not objects)
- Two modules have an entity with the same name but different fields
- A command handler in Module A calls `moduleB.service.doSomething()` (use events or ports)

---

## 5. Cross-Context Interaction Rules

How bounded contexts communicate — in priority order:

| Pattern | When to use | Example |
|---------|-------------|---------|
| **Reference by ID** | One context needs a stable pointer to another context's aggregate | `Flashcard` stores `workspaceId: string`, not `workspace: Workspace` |
| **Domain event (in-process)** | Source context emits; target context reacts asynchronously | `UserRegisteredEvent` → workspace creation handler |
| **Repository port** | One context needs to read (not own) data from another's store | `IFlashcardReadRepository` exposed by `flashcard`, imported by `study` |
| **Application service port** | One context needs a behavior from another (e.g., scheduling) | `ISpacedRepetitionPort` exposed by `learning/progress`, imported by `flashcard` |

### Rules

- **Never import a domain entity across contexts** — only import value object types and IDs
- **Never call a command handler from another module** — use events or ports
- **Read-only cross-context data** → expose a lightweight read interface (not the full repository)
- **Mutation in another context** → emit a domain event; let that context handle its own mutation
- **Shared value objects** (e.g., `WorkspaceId`, `UserId`) live in `server/src/core/ddd/` or a shared kernel — not in any single module

### Documentation requirement

Every domain README must include a **Context Dependencies** table:

```markdown
## Context Dependencies

| Dependency | Type | What we use |
|-----------|------|-------------|
| `workspace` | Read by ID | `workspaceId` on every aggregate |
| `learning/progress` | Port (`ISpacedRepetitionPort`) | Schedule next review interval |
| `dictionary` | Read by ID | `wordSenseId` on `Flashcard` |
```

---

## 6. Design Decisions

Each domain README should document significant design decisions that are not obvious from the code.

### Format

```markdown
## Design Decisions

| Decision | Alternatives Considered | Why This Approach |
|----------|------------------------|-------------------|
| `ReviewLog` is a child entity, not a separate aggregate | Separate `ReviewLog` aggregate | Review logs only exist in the context of a Flashcard; always saved atomically; no independent lifecycle |
| `Email` is a value object | Plain `string` field on `User` | Centralizes validation; prevents raw invalid strings from entering the domain |
| Study session does not own review cards | Embed card data inside session | Flashcards have their own lifecycle; session only references card IDs |
```

### When to document a decision

- You chose between two plausible designs
- Someone asked "why isn't this done differently?" in code review
- The design deviates from the reference architecture
- The design trades off simplicity for correctness (e.g., eventual over strong consistency)

### What NOT to document here

- Obvious choices that follow established project patterns without any alternative
- Framework-level choices (NestJS, MikroORM) — covered in ADRs under `docs/adr/`

---

## 7. Standard Template

Copy this block into every new `docs/domain/<module>/README.md`:

```markdown
# <Module> Domain

> One sentence describing this bounded context.

---

## Ubiquitous Language

| Term | Definition | Code Symbol |
|------|-----------|-------------|
| ... | ... | ... |

---

## Context Dependencies

| Dependency | Type | What we use |
|-----------|------|-------------|
| ... | Read by ID / Port / Event | ... |

---

## Aggregates

| Aggregate | Aggregate Root | Child Entities | Consistency Rule |
|-----------|---------------|---------------|-----------------|
| ... | ... | ... | ... |

---

## Entities

| Name | Type | Description | Source |
|------|------|-------------|--------|
| ... | AggregateRoot / Entity | ... | `path/to/file.ts` |

---

## Value Objects

| Name | Wraps | Validation Rule | Used By |
|------|-------|----------------|---------|
| ... | ... | ... | ... |

---

## Domain Rules

- `[RuleName]` — condition — enforced in `ClassName.method()`
- `[RuleName]` — condition — enforced in `ValueObject.validate()`

---

## Domain Events

| Event | Trigger | Payload Fields | Emitted In | Consistency |
|-------|---------|---------------|-----------|-------------|
| ... | ... | ... | `create()` / `mutatingMethod()` | Strong / Eventual |

---

## Domain Services

### <ServiceName>

Location: `domain/services/<service>.ts`

- **Purpose**: ...
- **Inputs**: ...
- **Returns**: ...
- **Why a service**: ...

---

## Repository Interfaces

### IXxxRepository

Location: `application/repositories/xxx.repository.interface.ts`

| Method | Signature | Description |
|--------|-----------|-------------|
| `persist` | `(entity: Xxx): void` | Stage entity for save |
| `findById` | `(id: string): Promise<Xxx \| null>` | Find by primary key |

---

## Use Cases (Commands)

| Command | Handler | Description |
|---------|---------|-------------|
| ... | ... | ... |

---

## Use Cases (Queries)

| Query | Handler | Returns | Description |
|-------|---------|---------|-------------|
| ... | ... | ... | ... |

---

## Design Decisions

| Decision | Alternatives Considered | Why This Approach |
|----------|------------------------|-------------------|
| ... | ... | ... |
```

---

## 8. Section Writing Guidelines

### Entities

**Table columns:** Name | Type | Description | Source

- **Type** must be one of: `AggregateRoot` or `Entity` — never "class" or "model"
- **AggregateRoot**: owns a consistency boundary, emits domain events, is the only entry point to its cluster
- **Entity**: child object inside an aggregate, has identity but does not emit events directly

**Example:**

| Name | Type | Description | Source |
|------|------|-------------|--------|
| `User` | AggregateRoot | Represents a registered user within a tenant | [`user.entity.ts`](../../server/src/modules/auth/domain/entities/user.entity.ts) |
| `ReviewLog` | Entity | Immutable record of a single card review event | [`review-log.entity.ts`](../../server/src/modules/flashcard/domain/entities/review-log.entity.ts) |

**`create()` vs `rehydrate()` — always document both:**
- `create()` — called for new domain objects; generates ID, emits domain events
- `rehydrate()` — called when restoring from persistence; no events emitted, no side effects

If an entity has neither a `create()` nor a `rehydrate()`, flag it as a pattern violation.

---

### Value Objects

**Table columns:** Name | Wraps | Validation Rule | Used By

- State the **concrete validation rule** — not "validates email" but "must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`"
- State what **invalid state** the VO prevents (primitive obsession risk)
- VOs are always created via static `create()` — construction without validation is forbidden

**Example:**

| Name | Wraps | Validation Rule | Used By |
|------|-------|----------------|---------|
| `Email` | `string` | Must match email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `User`, `AuthIdentity` |
| `Username` | `string` | Alphanumeric + dots, 3–30 chars | `User` |
| `CardRating` | `number` | Must be 1, 2, 3, or 4 (Again/Hard/Good/Easy) | `ReviewLog`, `UserWordSenseProgress` |

---

### Aggregates

**Table columns:** Aggregate | Aggregate Root | Child Entities | Consistency Rule

- **Consistency Rule** — the invariant the aggregate enforces as a unit (one sentence)
- External modules reference the aggregate only by **ID**, never by object reference

**Example:**

| Aggregate | Aggregate Root | Child Entities | Consistency Rule |
|-----------|---------------|---------------|-----------------|
| Word | `Word` | `WordSense` | A word must have at least one sense before it can be published |
| Flashcard | `Flashcard` | `ReviewLog` | Review logs are append-only and cannot be modified after creation |

---

### Aggregate Design Rules

Use these rules when deciding what goes inside an aggregate vs. what should be separate:

**Size rules — keep aggregates small**

- Include only entities that **must be consistent together** in the same transaction
- If an entity can be updated independently → it belongs in its own aggregate
- If two entities are always saved together → they may belong in the same aggregate
- Aim for aggregates loadable in a single DB query without joins across tables

**Boundary checklist**

| Question | If YES → | If NO → |
|----------|----------|---------|
| Must A and B always be saved atomically? | Same aggregate | Separate aggregates |
| Can B exist without A? | B is its own aggregate | B is a child entity of A |
| Does B need its own identity outside A? | Separate aggregate | Child entity |
| Is B only ever accessed through A? | Child entity of A | Separate aggregate |

**Transaction scope — one aggregate per write transaction**

- One command handler = one aggregate loaded, mutated, saved
- Cross-aggregate mutations → split into: (1) mutate first aggregate + emit event, (2) event handler mutates second aggregate in a separate transaction
- Never load two aggregate roots and mutate both in the same handler

**Examples from this codebase**

| Aggregate | Why these belong together | Why NOT expanded further |
|-----------|--------------------------|--------------------------|
| `Flashcard` + `ReviewLog` | A review log only exists for a flashcard; saved in same transaction | `UserWordSenseProgress` is NOT included — it is mutated independently |
| `Word` + `WordSense` | A word without any sense is invalid; both committed atomically | `Flashcard` is NOT included — it references `wordSenseId` by ID only |
| `StudySession` (no children) | Session state is self-contained | Review cards are separate `Flashcard` aggregates |

---

### Domain Rules (Invariants)

Format: `[RuleName]` — condition — enforced in `location`

Rules must:
- Use the ubiquitous language term (not variable names)
- State the condition clearly (positive or negative)
- State WHERE enforcement happens

**Example:**

- `[UniqueEmail]` — A User's email must be unique within a Tenant — enforced in `RegisterHandler` before `User.create()`
- `[ValidEmail]` — An Email value must match the email regex — enforced in `Email.validate()` (constructor guard)
- `[ImmutableReviewLog]` — A ReviewLog cannot be modified after creation — enforced by `ReviewLog` having no mutating methods
- `[PositiveDuration]` — Review duration must be > 0 ms — enforced in `ReviewLog` constructor

---

### Domain Events

**Table columns:** Event | Trigger | Payload Fields | Emitted In | Consistency

- **Emitted In** — events fire in `create()` or any state-mutating method (e.g., `User.activate()`). They are NEVER emitted in `rehydrate()`.
- **Consistency** — `Strong` if processed in the same transaction as the emitter; `Eventual` if processed in a separate transaction by an event listener
- List every field in the payload (not just the class name)
- Note any known downstream handlers

**Example:**

| Event | Trigger | Payload Fields | Emitted In | Consistency |
|-------|---------|---------------|-----------|-------------|
| `UserRegisteredEvent` | New user registers | `userId`, `email`, `tenantId`, `name` | `User.create()` | Eventual |
| `AuthIdentityCreatedEvent` | Auth identity created for user | `aggregateId`, `userId`, `tenantId` | `AuthIdentity.create()` | Eventual |
| `SessionCreatedEvent` | User successfully logs in | `aggregateId`, `userId`, `tenantId` | `Session.create()` | Eventual |

---

### Repository Interfaces

- Document the **interface** only — never the MikroORM implementation
- Interface lives in `application/repositories/` — link to it
- Implementation lives in `infrastructure/repositories/` — do NOT document it here
- Show the injection token helpers (`InjectXxx`, `provideXxx`) — these are how NestJS modules wire the dependency

**Example:**

**`IUserRepository`** — [`user.repository.interface.ts`](../../server/src/modules/auth/application/repositories/user.repository.interface.ts)

| Method | Signature | Description |
|--------|-----------|-------------|
| `persist` | `(user: User): void` | Stage user for insertion/update in Unit of Work |
| `findByEmail` | `(email: string): Promise<User \| null>` | Look up user by email, returns null if not found |

```typescript
// Injection helpers (generated by createInjection utility)
export const InjectUserRepository = inject;
export const provideUserRepository = provider;   // used in module providers
export const userRepositoryToken = token;
```

---

### Domain Services

A domain service encapsulates **domain logic that spans multiple entities or aggregates** and has no natural home in a single entity.

**When to use a domain service**

| Situation | Use domain service? |
|-----------|-------------------|
| Logic touches 2+ aggregates | ✅ Yes |
| Logic doesn't fit any single entity's responsibility | ✅ Yes |
| Logic is pure computation (no I/O, no persistence) | ✅ Yes |
| Logic belongs clearly to one aggregate | ❌ No — put it on the entity |
| Logic needs DB access or external calls | ❌ No — use an application service (command handler) or port |

**Rules**

- Domain services live in `domain/services/` — no framework decorators except `@Injectable()` for NestJS DI
- They operate only on **domain types** — never on ORM entities, DTOs, or raw primitives
- They are **stateless** — no instance fields that change between calls
- They are **not** command handlers — they contain pure domain logic called BY handlers

**Document it as**

```markdown
## Domain Services

### UsernameGeneratorService

Location: `domain/services/username-generator.service.ts`

- **Purpose**: Generates a unique username from a display name
- **Inputs**: `name: string`
- **Returns**: `Username` value object
- **Why a service**: Username generation spans naming rules and availability checks — it doesn't belong to `User.create()`
```

**Example from this codebase**

| Service | Module | Purpose |
|---------|--------|---------|
| `UsernameGeneratorService` | `auth` | Derives a `Username` VO from a display name; called by `RegisterHandler` before `User.create()` |
| `FsrsSchedulerService` | `learning/progress` | Computes next review interval from the spaced-repetition algorithm; called by `ReviewCardHandler` |

---

## 9. Consistency Model

Two consistency guarantees apply in different situations. Document which applies to each operation in your module.

### Strong consistency — within an aggregate

- **Scope**: all entities inside one aggregate root
- **Mechanism**: single database transaction (one `persistAndFlush` call)
- **Guarantee**: either all changes commit or none do

| When it applies | Example |
|----------------|---------|
| Mutating the aggregate root and its child entities together | Creating a `Flashcard` and its initial `ReviewLog` in one transaction |
| Enforcing aggregate invariants | `Word` must have at least one `WordSense` — checked before save |

### Eventual consistency — across aggregates

- **Scope**: two or more separate aggregate roots (even within the same module)
- **Mechanism**: domain event emitted after first aggregate saves → event handler mutates second aggregate in a separate transaction
- **Guarantee**: second aggregate will be updated, but NOT in the same transaction

| When it applies | Example |
|----------------|---------|
| One aggregate change triggers a change in another | `UserRegisteredEvent` → workspace provisioning handler creates a `Workspace` |
| Cross-module side effects | `CardReviewedEvent` → `learning/progress` updates `UserWordSenseProgress` |
| Cascading statistics updates | Session completed → study stats recalculated asynchronously |

### Decision rule

```
Is the change inside ONE aggregate root?
  YES → strong consistency (one transaction, one repository.save())
  NO  → eventual consistency (event → separate handler → separate transaction)
```

### Documentation requirement

For every domain event in the events table, document the consistency type:

```markdown
| Event | Trigger | Consistency | Handler |
|-------|---------|-------------|---------|
| `UserRegisteredEvent` | New user created | Eventual | `WorkspaceProvisioningHandler` |
| `CardReviewedEvent` | Card reviewed | Eventual | `UpdateProgressHandler` |
```

### Anti-patterns

| Anti-pattern | Problem | Fix |
|-------------|---------|-----|
| Two aggregate roots saved in one handler | Partial failure leaves data inconsistent | Split into event + second handler |
| Event handler that emits events that emit more events | Chain becomes impossible to trace | Max one level of event chaining; use a saga for complex flows |
| Assuming eventual consistency is immediate | Handler may fail; retries may be needed | Design handlers to be idempotent |

---

## 10. Example Flow: User Registration (End-to-End)

This flow illustrates how domain concepts map to code in a full write operation, from HTTP request to domain events.

### Trigger: `POST /api/v1/auth/register`

```
Client
  │  POST /auth/register { email, password, name }
  │
  ▼
RegisterController (Infrastructure)
  │  Validates DTO with class-validator
  │  Dispatches RegisterCommand { email, password, name }
  │
  ▼
RegisterHandler (Application Layer)
  │  1. IUserRepository.findByEmail(email)        — check [UniqueEmail] rule
  │  2. UsernameGeneratorService.generate(name)   — Username VO derived from name
  │  3. Email.create(email)                       — Email VO, throws if invalid
  │  4. User.create({ email, username, ... })     — AggregateRoot created
  │     └── addEvent(new UserRegisteredEvent(...))
  │  5. IUserRepository.persist(user)             — staged in Unit of Work
  │  6. unitOfWork.commit()                       — flushed to DB (strong consistency)
  │  7. user.publishEvents()                      — fires UserRegisteredEvent
  │
  ▼
WorkspaceProvisioningHandler (Event Listener — separate transaction)
  │  Receives UserRegisteredEvent
  │  Workspace.create({ ownerId: userId, ... })
  │  IWorkspaceRepository.persist(workspace)
  │  unitOfWork.commit()
  │
  ▼
Response: 201 Created { userId, email }
```

### Domain objects involved

| Object | Role | Key invariant enforced |
|--------|------|----------------------|
| `Email` VO | Validates email format | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `Username` VO | Validates username format | Alphanumeric + dots, 3–30 chars |
| `User` AggregateRoot | Owns user state; emits registration event | Email must be unique (enforced in handler before `create()`) |
| `UserRegisteredEvent` | Notifies downstream contexts | Carries all fields needed by subscribers |
| `IUserRepository` | Port: persists user | Interface in `application/`; MikroORM adapter in `infrastructure/` |
| `UsernameGeneratorService` | Derives `Username` from display name | Pure domain logic; no I/O |

### Consistency summary

| Step | Consistency | Reason |
|------|-------------|--------|
| `User` + `AuthIdentity` saved | Strong | Same aggregate cluster, one transaction |
| `Workspace` created after registration | Eventual | Separate aggregate in separate module; triggered by event |

---

## 11. Domain Testing Guidelines

Domain tests are **pure unit tests** — no database, no NestJS DI container, no HTTP.

### Test scope by layer

| Layer | What to test | Test type |
|-------|-------------|-----------|
| Value Objects | Valid inputs pass; invalid inputs throw; edge cases | Unit |
| Entities / AggregateRoots | `create()` state + events emitted; `rehydrate()` state + no events; invariant violations | Unit |
| Domain Services | Pure computation; correct output for given domain types | Unit |
| Repository interfaces | Do NOT test here — these are ports | — |
| Application Handlers | Correct orchestration; test doubles for ports and repositories | Unit + Integration |

### Value Object tests

```typescript
describe('Email', () => {
  it('creates a valid email', () => {
    expect(Email.create('user@example.com').value).toBe('user@example.com');
  });

  it('throws on invalid format', () => {
    expect(() => Email.create('not-an-email')).toThrow(ArgumentInvalidException);
  });

  it('throws on empty string', () => {
    expect(() => Email.create('')).toThrow();
  });
});
```

### Aggregate tests

```typescript
describe('User', () => {
  it('emits UserRegisteredEvent on create()', () => {
    const user = User.create({ email: Email.create('a@b.com'), ... });
    expect(user.domainEvents).toHaveLength(1);
    expect(user.domainEvents[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('does NOT emit events on rehydrate()', () => {
    const user = User.rehydrate({ id: 'existing-id', ... });
    expect(user.domainEvents).toHaveLength(0);
  });

  it('includes correct payload in UserRegisteredEvent', () => {
    const user = User.create({ email: Email.create('a@b.com'), tenantId: 't1', ... });
    const event = user.domainEvents[0] as UserRegisteredEvent;
    expect(event.email).toBe('a@b.com');
    expect(event.tenantId).toBe('t1');
  });
});
```

### Domain service tests

```typescript
describe('UsernameGeneratorService', () => {
  const service = new UsernameGeneratorService();

  it('generates a valid Username VO from a display name', () => {
    const username = service.generate('John Doe');
    expect(username).toBeInstanceOf(Username);
    expect(username.value).toMatch(/^[a-z0-9.]{3,30}$/);
  });
});
```

### Rules

- **No database in domain tests** — if a test needs `EntityManager`, it belongs in an integration test
- **No `Test.createTestingModule()`** in domain tests — instantiate classes directly
- **Test invariant violations** — every `[RuleName]` in Domain Rules must have a test verifying it throws
- **Test both `create()` and `rehydrate()`** — especially the absence of events in `rehydrate()`
- **Test event payload fields** — verify field values, not just the event class type
- **Co-locate test files** next to domain files: `user.entity.spec.ts` alongside `user.entity.ts`

### What NOT to test in domain tests

- ORM entity mapping — test in infrastructure layer
- HTTP request validation — test in e2e or controller tests
- Repository SQL queries — test in integration tests against a real DB

---

## 12. Code Pattern Quick Reference

### AggregateRoot — `create()` emits events, `rehydrate()` does not

```typescript
// server/src/modules/auth/domain/entities/user.entity.ts
export class User extends AggregateRoot {
  private constructor(props: CreateEntityProps<UserProps>) {
    super({ ...props });
    this.email = props.email;           // Email VO, already validated
  }

  static create(props: Omit<UserProps, 'role'> & { role?: UserRole }): User {
    const user = new User({ id: v7(), ...props });
    user.addEvent(new UserRegisteredEvent({ aggregateId: user.id, ... }));
    return user;
  }

  static rehydrate(props: CreateEntityProps<UserProps>): User {
    return new User(props);             // no events — restoring existing state
  }
}
```

### Entity — child object, no events

```typescript
// server/src/modules/flashcard/domain/entities/review-log.entity.ts
export class ReviewLog extends Entity {   // NOT AggregateRoot
  private _cardId!: FlashcardId | null;
  private _rating!: ReviewRating;
  // private fields only — immutable after creation

  static create(props: ReviewLogProps): ReviewLog { ... }
  static rehydrate(props: ...): ReviewLog { ... }
  // No addEvent() — ReviewLog is a child, not an aggregate root
}
```

### Value Object — private constructor, `create()` factory, throws on invalid

```typescript
// server/src/modules/auth/domain/value-objects/email.vo.ts
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
    this.validate({ value });
  }

  static create(value: string): Email {
    return new Email(value);            // throws ArgumentInvalidException if invalid
  }

  get value(): string { return this.props.value; }

  protected validate({ value }: { value: string }): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new ArgumentInvalidException('Invalid email format');
    }
  }
}
```

### Domain Event — plain class extending DomainEvent

```typescript
// server/src/modules/auth/domain/events/user-registered.event.ts
export class UserRegisteredEvent extends DomainEvent {
  public readonly userId: string;
  public readonly email: string;
  public readonly tenantId: string;
  public readonly name: string;

  constructor(props: DomainEventProps<UserRegisteredEventPayload>) {
    super(props);
    this.userId = props.userId;
    // ...
  }
}
```

### Repository Interface — port in application layer

```typescript
// server/src/modules/auth/application/repositories/user.repository.interface.ts
export interface IUserRepository {
  persist(user: User): void;
  findByEmail(email: string): Promise<User | null>;
}

const { inject, provider, token } = createInjection<IUserRepository>('IUserRepository');
export const InjectUserRepository = inject;
export const provideUserRepository = provider;
export const userRepositoryToken = token;
```

---

## 13. Review Checklist

Use this before merging a new or updated domain doc:

| Item | Pass? |
|------|-------|
| Ubiquitous Language glossary is present with at least 3 terms | ☐ |
| Every term in the doc matches the exact class/method name in code | ☐ |
| Each entity row specifies `AggregateRoot` or `Entity` — not "class" or "model" | ☐ |
| `create()` vs `rehydrate()` distinction is documented for each aggregate | ☐ |
| Domain Rules state WHERE the rule is enforced (file + method) | ☐ |
| Domain Events table lists payload fields (not just event class name) | ☐ |
| Domain Events `Emitted In` column lists the method — never `rehydrate()` | ☐ |
| Domain Events `Consistency` column is filled in (Strong / Eventual) | ☐ |
| Repository table shows the interface, not the MikroORM implementation | ☐ |
| Value Objects table includes the concrete validation rule | ☐ |
| No HTTP/DB/framework terms in any domain section | ☐ |
| Source file links are relative and resolve correctly | ☐ |
| Context Dependencies table is present | ☐ |
| Design Decisions section covers non-obvious aggregate or VO choices | ☐ |
| No `TBD`, `TODO`, or placeholder rows left | ☐ |

---

## 14. Anti-Patterns

| Anti-Pattern | What it looks like | Why it's wrong | Fix |
|-------------|-------------------|---------------|-----|
| **ORM columns in domain docs** | "The `tenant_id` column stores the tenant FK" | Domain docs describe concepts, not storage | Write "User belongs to a Tenant (referenced by ID)" |
| **HTTP language in domain rules** | "Returns 404 if user not found" | Domain has no concept of HTTP status codes | Write "`IUserRepository.findById()` returns `null` if not found" |
| **Entity called Aggregate** | "The `ReviewLog` aggregate" | `ReviewLog` extends `Entity`, not `AggregateRoot` | Check the base class; only document as aggregate if it extends `AggregateRoot` |
| **Events in `rehydrate()`** | Doc says event fires on DB load | Events in `rehydrate()` would fire on every read | State clearly: events only in `create()` or state-mutating methods |
| **Repository shows SQL/MikroORM** | `findByEmail()` doc shows `em.findOne(UserOrmEntity, ...)` | Leaks infrastructure into domain docs | Document only the interface method signature |
| **Command handlers in domain rules** | "LoginHandler calls `User.login()`" | Handlers are application layer, not domain | Domain rules belong to entities/VOs; handler notes go in Use Cases section |
| **Missing `create()` vs `rehydrate()`** | Only `create()` shown | Team can't tell when events fire | Always document both, even if `rehydrate()` is one line |
| **Generic type names** | "Item", "Record", "Data" in VO or entity names | Breaks ubiquitous language | Use domain-specific names: `ReviewLog`, `StudySession`, `WordSense` |
| **Single doc for multiple modules** | `learning.md` documents flashcard rules too | Violates bounded context isolation | One doc per module; cross-module references use ID references only |
| **Oversized aggregate** | `Order` owns `OrderLine`, `Shipment`, `Invoice`, `Payment`, `Return` | Too large to load atomically; wide transaction lock | Split into smaller aggregates linked by ID; use events for cross-aggregate reactions |
| **Domain service with I/O** | `PricingService` queries the DB for discounts | Domain services must be pure; I/O belongs in application layer | Pass the needed data as a parameter; let the handler fetch it and inject it |
| **Missing Design Decisions** | Non-obvious aggregate boundary with no explanation | Next developer changes the boundary without knowing why | Document the reasoning in the Design Decisions table |

---

## Related Documentation

- [Module Structure](../architecture/module-structure.md) — layer conventions, file naming, ports/adapters
- [CQRS Guidelines](../architecture/cqrs-guidelines.md) — command/query handler patterns
- [Architecture Overview](../architecture/architecture-overview.md) — system diagram and module dependencies
- [domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon) — reference architecture
