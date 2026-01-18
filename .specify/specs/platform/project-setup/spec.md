# Platform Specification: Backend Project Setup

**Type**: Platform Specification
**Version**: 1.0.0
**Status**: Draft
**Date**: 2026-01-18

---

## 1. Goal

### 1.1 What Problem This Setup Solves

This specification defines the foundational structure and bootstrapping behavior of the backend application. It ensures that:

- The application starts correctly across all runtime environments
- Configuration is loaded consistently and securely
- Cross-cutting concerns are applied uniformly
- The API surface is predictable and versioned
- Future development adheres to established architectural constraints

### 1.2 Why This Setup Exists

A well-defined project setup provides:

- **Consistency**: All team members work with the same foundational assumptions
- **Reliability**: Startup failures are caught early with clear diagnostics
- **Maintainability**: Changes to infrastructure concerns are isolated from business logic
- **Scalability**: The foundation supports growth without architectural rewrites
- **Compliance**: Security and operational requirements are embedded from the start

---

## 2. Scope

### 2.1 In-Scope Concerns

| Concern | Description |
|---------|-------------|
| Application bootstrapping | Entry point, module registration, lifecycle hooks |
| Environment awareness | Development, production, and test configurations |
| Configuration management | Loading, validation, and access patterns for config |
| Global middleware | Request-level processing applied to all routes |
| Global pipes | Validation and transformation of incoming data |
| API exposure | Prefix strategy, versioning, and Swagger documentation |
| Cross-cutting setup | Error handling registration, logging initialization |

### 2.2 Out-of-Scope Concerns

| Concern | Reason |
|---------|--------|
| Business logic implementation | Covered by feature specifications |
| Database schema design | Covered by data model specifications |
| Feature-specific endpoints | Covered by feature specifications |
| Deployment configuration | Covered by infrastructure specifications |
| CI/CD pipeline setup | Covered by DevOps specifications |
| Frontend integration | Covered by API contract specification |

---

## 3. Runtime Bootstrapping

### 3.1 Application Startup Flow

The application MUST follow this startup sequence:

1. **Environment Loading**: Load environment variables from `.env` files and system environment
2. **Configuration Validation**: Validate all required configuration values before proceeding
3. **Module Registration**: Register core, shared, and feature modules in dependency order
4. **Global Middleware**: Apply global middleware (logging, security, parsing)
5. **Global Pipes**: Apply global validation and transformation pipes
6. **Global Filters**: Register global exception filters
7. **API Documentation**: Initialize Swagger documentation (non-production: full; production: disabled or restricted)
8. **Server Binding**: Bind to configured host and port
9. **Health Check**: Verify critical dependencies (database, cache, external services)
10. **Ready Signal**: Log startup completion with timing metrics

### 3.2 Environment Awareness

The application MUST support three runtime environments:

| Environment | Purpose | Characteristics |
|-------------|---------|-----------------|
| `development` | Local development | Verbose logging, Swagger enabled, relaxed security |
| `test` | Automated testing | In-memory/mock dependencies, deterministic behavior |
| `production` | Live deployment | Minimal logging, Swagger disabled, strict security |

Environment detection rules:
- Environment MUST be determined by `NODE_ENV` variable
- If `NODE_ENV` is not set, the application MUST refuse to start
- Environment-specific config files MAY override base configuration

---

## 4. Configuration Management

### 4.1 Configuration Loading

Configuration MUST be loaded in the following order (later overrides earlier):

1. Default values (hardcoded fallbacks)
2. Base configuration file (`config/default.yaml` or equivalent)
3. Environment-specific file (`config/{environment}.yaml`)
4. Environment variables (highest priority)

### 4.2 Configuration Separation

Configuration MUST be organized into distinct namespaces:

| Namespace | Responsibility | Examples |
|-----------|----------------|----------|
| `app` | Application identity and behavior | name, version, environment |
| `http` | Server binding and limits | host, port, timeout, bodyLimit |
| `database` | Database connection | host, port, credentials, pool |
| `security` | Authentication and authorization | jwtSecret, tokenExpiry, cors |
| `logging` | Log behavior | level, format, destination |
| `swagger` | API documentation | enabled, path, title |

### 4.3 Configuration Validation

- All configuration values MUST be validated at startup
- Missing required values MUST cause startup failure
- Invalid values MUST be reported with clear error messages
- Secrets MUST NOT be logged or exposed in error messages

---

## 5. Global Middleware & Pipes

### 5.1 Validation

- All incoming request bodies MUST be validated against DTOs
- Validation errors MUST return `400 Bad Request` with field-level details
- Validation MUST use class-validator decorators
- Unknown properties MUST be stripped (whitelist mode)
- Implicit type conversion MUST be enabled

### 5.2 Security Headers

The following security headers MUST be applied to all responses:

| Header | Purpose |
|--------|---------|
| `X-Content-Type-Options: nosniff` | Prevent MIME sniffing |
| `X-Frame-Options: DENY` | Prevent clickjacking |
| `X-XSS-Protection: 1; mode=block` | XSS protection |
| `Strict-Transport-Security` | Enforce HTTPS (production only) |
| `Content-Security-Policy` | Restrict resource loading |

### 5.3 Cookie & Request Parsing

- JSON body parsing MUST be enabled with configurable size limit
- URL-encoded body parsing MUST be enabled
- Cookie parsing MUST be enabled for session management
- Multipart form data MUST be handled by specific endpoints, not globally

---

## 6. API Exposure

### 6.1 Global Prefix Strategy

- All API endpoints MUST be prefixed with `/api`
- The prefix MUST be configurable via environment
- Health check endpoints MAY be excluded from the prefix

### 6.2 API Versioning Strategy

- API versioning MUST use URL-based versioning: `/api/v1/...`
- Default version MUST be explicitly configured, not implied
- Version MUST be included in all endpoint paths
- Multiple versions MAY coexist during deprecation periods

### 6.3 Swagger Exposure Rules

| Environment | Swagger Behavior |
|-------------|------------------|
| `development` | Enabled at `/api/docs` with full schema |
| `test` | Disabled |
| `production` | Disabled by default; MAY be enabled behind authentication |

Swagger configuration MUST include:
- API title and version
- Server URLs for each environment
- Authentication schemes
- Tag-based grouping by module

---

## 7. Cross-cutting Concerns

### 7.1 Error Handling Expectations

- Global exception filter MUST catch all unhandled exceptions
- Error responses MUST follow the standard error contract
- Stack traces MUST NOT be exposed in production
- All errors MUST include correlation ID for tracing
- See [Error Handling Specification](../../memory/error-handling-spec.md) for detailed rules

### 7.2 Logging Expectations

- Structured logging (JSON) MUST be used in all environments
- Log entries MUST include: timestamp, level, correlation ID, context
- Sensitive data MUST NOT appear in logs
- Log levels MUST be configurable per environment
- Request/response logging MUST be opt-in, not default

### 7.3 Request Lifecycle Awareness

The application MUST support request lifecycle hooks:

| Phase | Purpose |
|-------|---------|
| Pre-request | Assign correlation ID, extract tenant context |
| Post-request | Log request completion, emit metrics |
| On-error | Log error, sanitize response |

---

## 8. Constraints & Invariants

The following rules MUST always be respected:

### 8.1 Architectural Constraints

- Business logic MUST NOT exist in `main.ts` or bootstrap code
- Configuration MUST NOT be accessed via `process.env` directly in modules
- All dependencies MUST be injected, never instantiated directly
- Core and shared modules MUST NOT depend on feature modules

### 8.2 Security Invariants

- Secrets MUST be loaded from environment variables, never committed to code
- Default configuration MUST be secure (fail-closed)
- CORS MUST be explicitly configured, not wildcarded in production
- Authentication MUST be enforced globally, with explicit public route exceptions

### 8.3 Operational Invariants

- Application MUST fail fast on configuration errors
- Health check endpoint MUST exist and respond to `/health`
- Graceful shutdown MUST be implemented for SIGTERM
- Database connections MUST be pooled and limited

---

## 9. Non-goals

This specification explicitly does NOT address:

| Non-goal | Reason |
|----------|--------|
| Feature implementation | Covered by feature specifications |
| Database migrations | Covered by database specification |
| Deployment procedures | Covered by infrastructure specification |
| Performance tuning | Covered by optimization specifications |
| Monitoring and alerting | Covered by observability specification |
| Third-party integrations | Covered per integration |
| Frontend concerns | Covered by frontend specifications |
| Development tooling (IDE, linting) | Covered by developer onboarding |

---

## 10. Related Documents

- [System Constitution](../../memory/constitution.md)
- [API Contract Specification](../../memory/api-contract-spec.md)
- [Error Handling Specification](../../memory/error-handling-spec.md)

---

**Ratified**: 2026-01-18
