<!--
Sync Impact Report:
- Version change: 2.4.0 → 2.5.0
- List of modified principles: None
- Added sections: §19 Constants & Configuration
- Modified sections: None
- Removed sections: None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (no changes needed)
- Follow-up TODOs: None
-->
# System Constitution – easy-english-v2

## 1. Purpose & Vision
The long-term goal of the easy-english-v2 system is to provide a highly effective, scalable, and adaptable Vocabulary Learning Platform. All design and implementation decisions MUST prioritize correctness, robust tenant safety, and the long-term evolution of the system. The architecture MUST be optimized for efficient learning experiences and extensibility.

## 2. Architectural Principles
- The backend architecture MUST adhere to the Command Query Responsibility Segregation (CQRS) pattern.
- A strict separation between Command (write/state change) and Query (read) responsibilities MUST be enforced at all layers.
- Business logic is forbidden in controllers or UI components. Logic MUST reside in domain entities, services, and command/query handlers.
- The system MUST be composed of clearly defined modules, representing distinct Bounded Contexts as per Domain-Driven Design.

## 3. Multi-Tenancy Principles
- Tenant data isolation is a non-negotiable, mandatory requirement.
- All data access, whether read or write, MUST be scoped by a tenant identifier. There are no exceptions.
- Cross-tenant data access is strictly forbidden by default. Any exception requires explicit, documented approval and a separate security review.
- The tenant context MUST be explicit, propagated through all layers of the application, and traceable in all logs and audit trails.
- Shared infrastructure MUST NOT imply shared data. Physical or logical resource sharing must never compromise tenant data boundaries.

## 4. Security Principles
- Authentication and Authorization are mandatory for all protected resources. No endpoint is public unless explicitly marked as such.
- All authorization policies MUST be tenant-aware. A user's access rights are only valid within their designated tenant context.
- All sensitive data, including but not limited to user PII and credentials, MUST be encrypted both at rest and in transit.
- The principle of least-privilege access MUST be applied to all system accounts, user roles, and API clients.
- Security and data privacy rules override convenience and performance considerations.

## 5. CQRS Rules
- Commands are solely responsible for state mutation. They MUST NOT return data, except for simple acknowledgments or identifiers for asynchronous operations.
- Queries are strictly read-only and MUST NOT cause any state changes. They should be optimized for read performance.
- The mixing of Command and Query responsibilities within a single class, method, or endpoint is forbidden.

## 6. Error Handling & Resilience
- All runtime errors MUST be classified into one of three categories: Client Errors (e.g., bad input), Domain Errors (e.g., business rule violation), or System Errors (e.g., infrastructure failure).
- Internal system error details MUST NEVER be leaked to clients. Generic error messages should be returned while details are logged.
- A centralized exception handling mechanism is required for both backend and frontend to ensure consistent error responses.
- All errors MUST be traceable via correlation IDs linking client requests to server-side logs.
- For detailed implementation standards, error codes, and response formats, all services MUST adhere to the [Error Handling Specification](./error-handling.md).

## 7. Performance & Scalability
- Read-heavy workloads are expected and MUST be optimized. The query stack should be designed for high performance and potential caching.
- Caching strategies are permitted only on the read (Query) side of the system. The write (Command) side must always operate on the source of truth.
- The performance of critical queries MUST be monitored.
- Premature optimization is discouraged. Blind optimization without measurement is forbidden. Performance work must be driven by data and explicit requirements.
- **SLA/SLO**: Critical API endpoints MUST meet defined response time thresholds. Performance budgets should be established and monitored for key user flows.

## 8. Observability & Monitoring
- Structured logging (e.g., JSON) is mandatory for all services.
- All log entries MUST include contextual information, such as tenant ID, user ID (if applicable), correlation ID, and application area.
- The use of metrics and distributed tracing to monitor system health and request lifecycles is strongly encouraged.
- Production behavior must be observable through telemetry, not inferred by debugging or guesswork.

## 9. API Design & Versioning
- All APIs MUST be explicitly versioned (e.g., `/api/v1/...`).
- Backward compatibility for existing API versions is the preferred method of evolution.
- Any breaking change to an API contract requires the introduction of a new API version. The old version should be deprecated according to a defined policy.
- API contracts MUST NOT expose internal domain models directly. Data Transfer Objects (DTOs) MUST be used for all API communication.
- **API Contract Standards**: All endpoints MUST adhere to the standards for HTTP methods, status codes, and endpoint patterns defined in the [API Contract Specification](./api-contract.md).
- **Standard Response Schema**: All API responses, for both success and error cases, MUST conform to the standard response envelope defined in the [API Response Schema Specification](./response-schema.md).
- **Rate Limiting**: Rate limiting MUST be enforced on all public APIs to prevent abuse and ensure fair resource usage across tenants.

## 10. Database & Migration Policy
- The database schema is considered an implementation detail of the persistence layer and MUST NOT be directly coupled to the domain model.
- All schema changes MUST be versioned and applied via an automated migration tool.
- Destructive migrations (e.g., dropping columns/tables) require explicit approval and a data backup or migration plan.
- Data safety and integrity are prioritized over developer convenience.

## 11. Dependency Management
- The introduction of any new external dependency (library, framework, or service) MUST be justified and documented.
- All dependency versions MUST be pinned and controlled via a lock file.
- Avoid introducing new dependencies that provide overlapping functionality with existing ones.
- Dependencies MUST be reviewed for security vulnerabilities and maintenance status before being adopted.

## 12. Frontend Architecture Principles
- The frontend application MUST follow a modular architecture, with clear separation of concerns between UI components, state management, and API services.
- Business rules and validation logic MUST NOT be duplicated from the backend. The backend is the single source of truth.
- API contracts are the source of truth for all data structures. Frontend models should be generated or derived from these contracts where possible.
- UI optimizations and client-side state management MUST NOT break or subvert the domain rules enforced by the backend.
- **State Management**: 
  - **Zustand** MUST be used for client-side state (UI state, user preferences, local app state).
  - **TanStack Query (React Query)** MUST be used for server state (API data fetching, caching, synchronization).
  - Mixing server state into Zustand stores is forbidden; use TanStack Query for all async data.
- **UI Component Library**: **Shadcn UI** is the designated component library. Custom components should extend Shadcn primitives rather than creating parallel implementations.

## 13. Code Style & Conventions
- A consistent set of coding conventions is mandatory for all codebases (backend and frontend).
- Automated tooling (e.g., ESLint, Prettier, or equivalents) MUST be integrated into the development workflow to enforce style and catch common errors.
- Code readability and maintainability are prioritized over "clever" or overly concise implementations.

## 14. Conflict Resolution
- This Constitution takes precedence over all other specifications, documents, or team conventions.
- Any conflict between a proposed design and this Constitution MUST be documented explicitly in the design proposal.
- Proposed changes that are non-compliant with this Constitution will be rejected or must be revised to achieve compliance.

## 15. Testing Requirements
- All business logic MUST have unit test coverage. Tests should be independent, repeatable, and fast.
- Integration tests are required for all Command handlers and API endpoints to verify CQRS flow and cross-component interactions.
- E2E tests are required for critical user flows (authentication, core learning features).
- External dependencies MUST be mocked in unit tests. Integration tests may use test containers or in-memory implementations.
- Test data MUST be tenant-isolated and cleaned up after test execution.

## 16. CI/CD & Quality Gates
- All code changes MUST pass automated linting, type checking, and test suites before merge.
- Code coverage thresholds MUST be maintained for critical modules. Coverage regressions are not permitted.
- Pull requests require at least one approval from a qualified reviewer who verifies compliance with this Constitution.
- Automated security scanning (dependency vulnerabilities, static analysis) MUST be part of the CI pipeline.
- Deployments to production MUST follow a defined release process with rollback capabilities.

## 17. Documentation Standards
- **API Documentation**: All backend APIs MUST be documented using **OpenAPI/Swagger** specification.
- OpenAPI schemas MUST be kept in sync with the actual implementation. Auto-generation from code annotations is preferred.
- **Client Generation**: API clients for frontend applications (Angular, React) MUST be auto-generated from OpenAPI specifications to ensure type safety and contract consistency.
- Code documentation (comments, README files) MUST be maintained for complex modules and public interfaces.
- Architecture Decision Records (ADRs) SHOULD be used to document significant architectural choices.

## 18. Design for Extensibility & Maintainability
- The system MUST favor design patterns that promote loose coupling and high cohesion. This includes, but is not limited to, patterns like Strategy, Observer, Factory, and Decorator where appropriate.
- The goal is to create a system where adding new functionality or modifying existing behavior can be done with minimal impact on unrelated components.
- **Rationale**: A loosely coupled architecture reduces the risk and cost of change. By relying on established design patterns, we ensure that the system remains understandable, maintainable, and extensible as new requirements emerge and the team evolves. This principle directly supports the long-term vision of an adaptable platform.

## 19. Constants & Configuration
- Hardcoding literal values (magic numbers, strings, URLs, timeouts, limits, etc.) directly in business logic or UI code is **strictly forbidden**.
- All configurable values MUST be extracted into:
  - **Constants files** (e.g., `constants.ts`, `config.ts`) for static, compile-time values.
  - **Environment variables** for runtime configuration that may differ across environments.
- Constants MUST be named descriptively and grouped logically (e.g., `API_ENDPOINTS`, `VALIDATION_LIMITS`, `UI_DEFAULTS`).
- Duplication of the same literal value across multiple files is forbidden. A single source of truth MUST be established.
- **Rationale**: Centralizing configuration values improves maintainability, reduces bugs from inconsistent values, and makes the system easier to adapt to new requirements or environments without code changes scattered across the codebase.

**Version**: 2.5.0 | **Ratified**: 2026-01-17 | **Last Amended**: 2026-01-18