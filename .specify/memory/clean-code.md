# Clean Code Guidelines

> **Version**: 1.0.0 | **Ratified**: 2026-01-18

This document defines the coding standards and best practices for the easy-english-v2 project. All code contributions MUST adhere to these guidelines.

---

## 1. Constants Over Magic Values

- **MUST** replace all hard-coded literals (numbers, strings, URLs, timeouts) with named constants.
- Constants MUST be named descriptively to explain the value's purpose.
- Constants SHOULD be organized in dedicated files:
  - `constants.ts` for domain/business constants
  - `config.ts` for environment-dependent configuration
- Group related constants using objects or enums:

```typescript
// ❌ Bad
if (user.age >= 18) { ... }
fetch('/api/v1/users')

// ✅ Good
const AGE_LIMITS = {
  ADULT: 18,
  SENIOR: 65,
} as const;

const API_ENDPOINTS = {
  USERS: '/api/v1/users',
  HEALTH: '/api/v1/health',
} as const;

if (user.age >= AGE_LIMITS.ADULT) { ... }
fetch(API_ENDPOINTS.USERS)
```

---

## 2. Meaningful Names

### Variables & Functions
- Names MUST reveal intent and purpose.
- Avoid abbreviations unless universally understood (`id`, `url`, `api`).
- Use verb prefixes for functions: `get`, `set`, `is`, `has`, `can`, `should`, `create`, `update`, `delete`.

```typescript
// ❌ Bad
const d = new Date();
const u = users.filter(x => x.a);
function proc(data) { ... }

// ✅ Good
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
function processUserRegistration(userData: UserDto) { ... }
```

### Booleans
- Prefix with `is`, `has`, `can`, `should`, `was`, `will`.

```typescript
// ❌ Bad
const active = true;
const permission = user.canEdit;

// ✅ Good
const isActive = true;
const hasEditPermission = user.canEdit;
```

### Classes & Types
- Use PascalCase for classes, interfaces, types, and enums.
- Suffix DTOs with `Dto`, entities with `Entity` if needed for clarity.

---

## 3. Smart Comments

### When NOT to Comment
- **Don't** comment on what the code does – make the code self-documenting.
- **Don't** leave commented-out code – use version control instead.

### When to Comment
- **Why**: Explain non-obvious business decisions or workarounds.
- **APIs**: Document public interfaces with JSDoc/TSDoc.
- **Warnings**: Flag potential issues or edge cases.
- **TODOs**: Use `TODO(author):` format with context.

```typescript
// ❌ Bad - explains what
// Loop through users and check if active
users.forEach(user => { if (user.isActive) { ... } });

// ✅ Good - explains why
// We filter by tenant first to avoid loading all users into memory
// before applying the active filter (performance optimization for large datasets)
const activeUsers = await userRepository.findByTenant(tenantId, { isActive: true });
```

---

## 4. Single Responsibility Principle (SRP)

- Each function MUST do exactly **one thing**.
- Functions SHOULD be **< 20 lines** (excluding imports/types).
- If a function needs a comment to explain what it does, it SHOULD be split.

```typescript
// ❌ Bad - does multiple things
async function handleUserRegistration(data) {
  validateEmail(data.email);
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await userRepository.save({ ...data, password: hashedPassword });
  await emailService.sendWelcome(user.email);
  await analyticsService.track('user_registered', user.id);
  return user;
}

// ✅ Good - single responsibility, composed
async function handleUserRegistration(data: RegisterUserDto): Promise<User> {
  const validatedData = validateRegistrationData(data);
  const user = await createUser(validatedData);
  await sendWelcomeNotifications(user);
  return user;
}
```

---

## 5. DRY (Don't Repeat Yourself)

- Extract repeated code into reusable functions or utilities.
- Maintain **single sources of truth** for business logic.
- Use generics and higher-order functions for shared patterns.

```typescript
// ❌ Bad - duplicated validation
function createTenant(data) {
  if (!data.name || data.name.length < 3) throw new Error('Invalid name');
  // ...
}
function updateTenant(data) {
  if (!data.name || data.name.length < 3) throw new Error('Invalid name');
  // ...
}

// ✅ Good - shared validation
const validateTenantName = (name: string) => {
  if (!name || name.length < VALIDATION.TENANT_NAME_MIN_LENGTH) {
    throw new ValidationError('Tenant name is too short');
  }
};
```

---

## 6. Code Structure & Organization

### File Organization
```
src/
├── modules/
│   └── [module-name]/
│       ├── commands/          # Write operations
│       ├── queries/           # Read operations
│       ├── dto/               # Data transfer objects
│       ├── entities/          # Domain entities
│       ├── [module].controller.ts
│       ├── [module].module.ts
│       └── [module].service.ts
├── shared/
│   ├── constants/
│   ├── utils/
│   └── types/
└── core/
    ├── database/
    ├── config/
    └── filters/
```

### Import Order
1. External libraries (node_modules)
2. Internal aliases (`@app/`, `@shared/`)
3. Relative imports (same module)

---

## 7. Encapsulation & Abstraction

- **Hide implementation details** – expose only what's necessary.
- Move complex conditionals into well-named functions.
- Use private methods/properties to prevent external access.

```typescript
// ❌ Bad - exposed implementation
if (user.role === 'admin' || user.role === 'superadmin' || user.permissions.includes('manage_users')) {
  // allow access
}

// ✅ Good - encapsulated
if (user.canManageUsers()) {
  // allow access
}

// In User class/entity
canManageUsers(): boolean {
  return this.isAdmin() || this.hasPermission(Permission.MANAGE_USERS);
}
```

---

## 8. Error Handling

> **Reference**: For detailed error classification, response format, and logging standards, see [Error Handling Specification](./error-handling.md).

**Key Rules for Clean Code**:
- **Never** swallow errors silently.
- Use typed/custom error classes for domain errors.
- Always provide meaningful error messages.
- Log errors with context (`tenantId`, `userId`, `correlationId`).

```typescript
// ❌ Bad
try {
  await doSomething();
} catch (e) {
  console.log(e);
}

// ✅ Good
try {
  await doSomething();
} catch (error) {
  this.logger.error('Failed to process request', {
    error,
    tenantId: context.tenantId,
    correlationId: context.correlationId,
  });
  throw new DomainException('Operation failed', ErrorCode.OPERATION_FAILED);
}
```

---

## 9. Async/Await Best Practices

- Prefer `async/await` over `.then()` chains.
- Use `Promise.all()` for independent parallel operations.
- Always handle promise rejections.

```typescript
// ❌ Bad - sequential when parallel is possible
const users = await getUsers();
const orders = await getOrders();

// ✅ Good - parallel execution
const [users, orders] = await Promise.all([
  getUsers(),
  getOrders(),
]);
```

---

## 10. Type Safety (TypeScript)

- **MUST** avoid `any` type – use `unknown` if type is truly unknown.
- Define explicit return types for public functions.
- Use discriminated unions for state handling.
- Prefer `interface` for object shapes, `type` for unions/primitives.

```typescript
// ❌ Bad
function processData(data: any): any { ... }

// ✅ Good
function processData(data: UserInputDto): ProcessedResult { ... }
```

---

## 11. Testing Considerations

- Write code that is testable (dependency injection, pure functions).
- Keep side effects at the edges of your application.
- Name tests descriptively: `should_returnError_when_userNotFound`.

---

## 12. Version Control

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

```
feat(auth): add JWT refresh token support
fix(tenant): resolve data isolation issue in queries
docs: update API documentation for v2 endpoints
```

### Branch Naming
```
feature/[ticket-id]-short-description
bugfix/[ticket-id]-short-description
hotfix/[ticket-id]-short-description
```

---

## 13. Code Review Checklist

Before submitting a PR, verify:

- [ ] No magic numbers/strings – all values are constants
- [ ] Names are meaningful and self-documenting
- [ ] Functions are small and single-purpose
- [ ] No duplicated code
- [ ] Error handling is complete
- [ ] Types are explicit (no `any`)
- [ ] Tests cover the changes
- [ ] Commit messages follow conventions

---

## References

- [Constitution §13: Code Style & Conventions](./constitution.md#13-code-style--conventions)
- [Constitution §19: Constants & Configuration](./constitution.md#19-constants--configuration)
- [Error Handling Specification](./error-handling.md) - Error classification, response format, traceability
- [API Contract Specification](./api-contract.md) - DTO naming, request/response standards
- [API Response Schema](./response-schema.md) - Standard envelope format
- [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
