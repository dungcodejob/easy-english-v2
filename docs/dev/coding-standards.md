# Coding Standards

> Code conventions, naming rules, and architectural patterns for Easy English V2.

---

## 1. General Principles

| Principle | Description |
|---------|-------------|
| **Explicit over implicit** | Be clear about types, errors, and intent |
| **Single responsibility** | Each function/class does one thing well |
| **No magic** | Avoid hidden behavior; prefer convention |
| **Immutable first** | Prefer immutable data structures |
| **Fail fast** | Validate inputs at the boundary |

---

## 2. TypeScript

### 2.1 Strict Mode

`tsconfig.json` enforces strict mode. All flags are enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2 Type Imports

Use `import type` for types only — avoids runtime overhead:

```typescript
// Good — type-only import
import type { UserResponseDto } from '../types';

// Bad — runtime import of a type
import { UserResponseDto } from '../types';
```

### 2.3 Avoid `any`

Never use `any`. Use `unknown` when the type is genuinely unknown, then narrow it:

```typescript
// Bad
function parse(input: any): User { ... }

// Good
function parse(input: unknown): User {
  if (!isUser(input)) throw new Error('Invalid input');
  return input;
}
```

### 2.4 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `accessToken`, `dueDate` |
| Functions | camelCase | `createFlashcard`, `getDueCards` |
| Classes/Types | PascalCase | `UserEntity`, `FlashcardResponseDto` |
| Interfaces | PascalCase | `UserProps`, `CreateFlashcardDto` |
| Enums | PascalCase | `SessionStatus`, `WorkspaceType` |
| Enum values | SCREAMING_SNAKE_CASE | `SessionStatus.ACTIVE` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files (classes) | kebab-case | `user.entity.ts`, `flashcard.repository.ts` |
| Files (utilities) | kebab-case | `use-local-storage.ts`, `clean-empty-params.ts` |

### 2.5 ORM vs Domain Entities

Two separate files for every entity:

```typescript
// Domain entity — pure TypeScript, no framework imports
// File: server/src/modules/learning/progress/domain/entities/user-word-sense-progress.entity.ts
export class UserWordSenseProgress extends AggregateRoot {
  private _fsrsParams!: FsrsParameters;
  // No @Property, @PrimaryKey decorators here
}

// ORM entity — MikroORM decorators
// File: server/src/modules/learning/progress/infrastructure/orm-entities/user-word-sense-progress.orm-entity.ts
@Entity({ tableName: 'user_word_sense_progress' })
export class UserWordSenseProgressOrmEntity {
  @PrimaryKey({ type: 'uuid' }) _id!: string;
  @Property({ type: 'uuid' }) _workspaceId!: string;
}
```

---

## 3. NestJS Conventions

### 3.1 Module Structure

```
module/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/       # Interfaces only
│   └── events/
├── application/
│   ├── commands/          # One folder per command
│   │   ├── create-flashcard.command.ts
│   │   └── create-flashcard.handler.ts
│   └── queries/
├── infrastructure/
│   ├── persistence/       # Repository implementations
│   └── orm-entities/
└── presentation/
    ├── dto/
    │   ├── requests/
    │   └── responses/
    └── controllers/
```

### 3.2 Dependency Injection

Inject repositories via constructor, not `@Inject()`:

```typescript
// Good — typed repository injection
constructor(
  private readonly flashcardRepository: FlashcardRepository,
) {}

// Bad — string-based injection
constructor(
  @Inject(FLASH_CARD_REPOSITORY) private readonly repository: any,
) {}
```

### 3.3 DTOs

Use class-validator decorators for all DTOs:

```typescript
// File: server/src/modules/flashcard/presentation/dto/create-flashcard.dto.ts
export class CreateFlashcardDto {
  @ApiProperty({ example: 'Hello' })
  @IsString()
  @MaxLength(500)
  front!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
```

---

## 4. React/Frontend Conventions

### 4.1 Component Types

| Type | Rule | File Location |
|------|------|-------------|
| Page | Orchestrates hooks + components | `pages/` |
| Component | Dumb UI, receives data as props | `components/` |
| Hook | Business logic, data fetching | `hooks/` |
| Service | API calls only | `services/` |
| Store | Zustand state management | `stores/` |

### 4.2 Component Props

Always type component props explicitly:

```typescript
// Good
interface FlashcardViewProps {
  front: string;
  back: string;
  notes?: string;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
}

// Bad — implicit any or untyped props
export function FlashcardView(props) { ... }
```

### 4.3 TanStack Query — Never Fetch in Render

```typescript
// Bad — fetch inside render causes infinite loop
function Component() {
  const { data } = useQuery({ queryFn: () => api.get('/data') });
}

// Good — use the hook pattern
const { data } = useFlashcards(); // Hook encapsulates the query
```

### 4.4 Zustand — Expose Actions, Not State Directly

```typescript
// Good — actions exposed via a hook
export const useAuthActions = () => useAuthStore((s) => s.actions);
export const useUser = () => useAuthStore((s) => s.user);

// Bad — exposing the entire store
export const useAuthStore = () => useAuthStore();
```

---

## 5. Testing Standards

### 5.1 Test File Location

```
entity.ts
entity.spec.ts       ← Unit tests (same directory)
entity.e2e-spec.ts  ← E2E tests (test/ directory)
```

### 5.2 Naming Tests

```typescript
describe('UserWordSenseProgress', () => {
  describe('applyReview', () => {
    it('should update stability when rating is Good', () => { ... });
    it('should emit WordReviewedEvent', () => { ... });
    it('should throw AlreadyArchivedException when archived', () => { ... });
  });
});
```

### 5.3 Arrange-Act-Assert

```typescript
it('should calculate next interval as 1 day for Good rating', () => {
  // Arrange
  const progress = UserWordSenseProgress.create({ userId, tenantId, wordSenseId });

  // Act
  progress.applyReview(ReviewRating.Good, newParams, 2000);

  // Assert
  expect(progress.fsrsParams.stability).toBeGreaterThan(0);
});
```

---

## 6. Error Handling

### Server — Use `Result<T, E>`

```typescript
// Bad — throwing for expected errors
async execute(cmd: CreateFlashcardCommand): Promise<void> {
  const existing = await this.repo.findOne(cmd.front);
  if (existing) throw new ConflictException('Card already exists');
}

// Good — explicit Result type
async execute(cmd: CreateFlashcardCommand): Promise<Result<void, DomainError>> {
  const existing = await this.repo.findOne(cmd.front);
  if (existing) return err(new ConflictError('Card already exists'));
  return ok();
}
```

### Client — Use `ApiRequestError`

```typescript
const { mutate, error } = useCreateFlashcard();

if (error?.isDomainError()) {
  showToast(error.message);
}
if (error?.isClientError()) {
  const fieldError = error.getFieldError('front');
  setError('front', { message: fieldError });
}
```

---

## 7. Related Documentation

- [Setup Guide](./setup.md) — Environment configuration
- [Git Workflow](./git-workflow.md) — Branch strategy and PR process
- [Folder Structure](./folder-structure.md) — Project layout
