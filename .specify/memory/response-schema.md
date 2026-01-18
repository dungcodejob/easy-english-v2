# API Response Schema Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-18
**Status**: Ratified

---

## 1. Introduction

### 1.1 Purpose

This document defines the **standard API response schema** for all HTTP APIs in the Easy English platform. It establishes a consistent contract between backend services and frontend clients.

### 1.2 Why Standardization

- **Predictability**: Clients can rely on a consistent structure across all endpoints
- **Error Handling**: Unified error format simplifies client-side error processing
- **Extensibility**: New metadata can be added without breaking existing clients
- **Observability**: Correlation IDs enable end-to-end tracing

### 1.3 Relationship to CQRS

- **Commands** return minimal data (acknowledgment, created ID)
- **Queries** return full data payloads
- Both MUST use the same envelope structure

### 1.4 Related Documents

- [API Contract Specification](./api-contract-spec.md)
- [Error Handling Specification](./error-handling-spec.md)

---

## 2. Response Envelope Overview

### 2.1 Core Principle

Every API response MUST be wrapped in a **response envelope**. Raw data responses are **forbidden**.

### 2.2 Rules

| Rule | Enforcement |
|------|-------------|
| All responses MUST use the envelope | No exceptions |
| The `success` field MUST be present | Always |
| The `data` field MUST be present on success | Even if `null` |
| The `error` field MUST be present on failure | Always on 4xx/5xx |

---

## 3. Success Response Schema

### 3.1 Structure

```
{
  "success": true,
  "data": <T | null>,
  "meta": { ... },           // Optional
  "pagination": { ... },     // Optional (for lists)
  "correlationId": "uuid",   // Optional
  "timestamp": "ISO-8601"    // Optional
}
```

### 3.2 Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | `boolean` | MUST | Always `true` for 2xx responses |
| `data` | `T \| null` | MUST | The response payload |
| `meta` | `object` | MAY | Additional metadata (e.g., deprecation warnings) |
| `pagination` | `object` | MAY | Pagination info for list endpoints |
| `correlationId` | `string` | SHOULD | Request correlation ID for tracing |
| `timestamp` | `string` | MAY | ISO-8601 response timestamp |

### 3.3 When `data` Can Be `null`

- **Commands**: After successful mutation with no return value (e.g., DELETE)
- **Queries**: When the requested resource does not exist (with 200 OK)
- **Empty results**: Single-item lookups that return nothing

### 3.4 Difference Between `meta` and `pagination`

| Aspect | `meta` | `pagination` |
|--------|--------|--------------|
| Purpose | General metadata | List navigation |
| When used | Any endpoint | List endpoints only |
| Examples | `{ "deprecated": true }` | `{ "total": 100 }` |

### 3.5 CQRS Implications

| Type | `data` Content |
|------|----------------|
| **Command (Create)** | `{ "id": "uuid" }` |
| **Command (Update)** | `null` or `{ "id": "uuid" }` |
| **Command (Delete)** | `null` |
| **Query (Single)** | Full entity DTO |
| **Query (List)** | Array of entity DTOs |

---

## 4. Error Response Schema

### 4.1 Structure

```
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "type": "client | domain | system",
    "message": "Human-readable message",
    "details": [ ... ]       // Optional
  },
  "correlationId": "uuid"
}
```

### 4.2 Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | `boolean` | MUST | Always `false` for error responses |
| `error.code` | `string` | MUST | Stable, machine-readable error code |
| `error.type` | `enum` | MUST | Error category |
| `error.message` | `string` | MUST | Human-readable description |
| `error.details` | `array` | MAY | Field-level validation errors |
| `correlationId` | `string` | MUST | For error tracing |

### 4.3 Error Categories

| Type | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `client` | 400, 401, 403, 404, 422 | Client-caused errors | Invalid input, unauthorized |
| `domain` | 409, 422 | Business rule violations | "User already exists" |
| `system` | 500, 502, 503 | Infrastructure failures | Database unavailable |

### 4.4 Error Detail Structure

For validation errors, `details` MAY contain field-specific information:

```
{
  "field": "email",
  "message": "Must be a valid email address",
  "code": "INVALID_FORMAT"
}
```

### 4.5 Security Rules

| Rule | Enforcement |
|------|-------------|
| Internal stack traces MUST NOT be exposed | Always |
| Database error details MUST NOT be leaked | Always |
| System errors SHOULD use generic messages | In production |

---

## 5. Pagination Schema

This section aligns with [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) pagination semantics.

### 5.1 Offset-Based Pagination

**When to use**: Traditional page-based navigation, admin dashboards, known dataset sizes.

**Parameters**: `$top`, `$skip`, `$count`

```
{
  "pagination": {
    "top": 20,
    "skip": 40,
    "count": 150,
    "hasMore": true
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `top` | `integer` | Number of items returned |
| `skip` | `integer` | Number of items skipped |
| `count` | `integer \| null` | Total count (if `$count=true` requested) |
| `hasMore` | `boolean` | More items available |

### 5.2 Cursor-Based Pagination

**When to use**: Infinite scroll, real-time feeds, large or frequently changing datasets.

**Parameters**: `$top`, `$skiptoken`

```
{
  "pagination": {
    "top": 20,
    "nextLink": "/api/v1/words?$top=20&$skiptoken=eyJpZCI6MTIwfQ==",
    "hasMore": true
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `top` | `integer` | Items returned |
| `nextLink` | `string \| null` | Full URL for next page |
| `hasMore` | `boolean` | More items available |

### 5.3 Selection Criteria

| Scenario | Recommended | Rationale |
|----------|-------------|-----------|
| Admin tables with page numbers | Offset (`$top` + `$skip`) | Users need "page X of Y" |
| Mobile infinite scroll | Cursor (`$skiptoken`) | Consistent ordering under changes |
| Real-time data feeds | Cursor (`$skiptoken`) | Items may be added/removed |
| Export/batch processing | Cursor (`$skiptoken`) | Handles large datasets efficiently |

---

## 6. Examples

### 6.1 Successful Query Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "word": "ephemeral",
    "definition": "Lasting for a very short time"
  },
  "correlationId": "req-abc-123"
}
```

### 6.2 Successful Command Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "correlationId": "req-abc-124"
}
```

### 6.3 Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "type": "client",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "INVALID_FORMAT"
      },
      {
        "field": "password",
        "message": "Must be at least 8 characters",
        "code": "TOO_SHORT"
      }
    ]
  },
  "correlationId": "req-abc-125"
}
```

### 6.4 Domain Error Response

```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "type": "domain",
    "message": "A user with this email already exists"
  },
  "correlationId": "req-abc-126"
}
```

### 6.5 System Error Response

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "type": "system",
    "message": "An unexpected error occurred. Please try again later."
  },
  "correlationId": "req-abc-127"
}
```

### 6.6 Paginated List Response

```json
{
  "success": true,
  "data": [
    { "id": "1", "word": "ephemeral" },
    { "id": "2", "word": "ubiquitous" }
  ],
  "pagination": {
    "top": 20,
    "skip": 0,
    "count": 150,
    "hasMore": true
  },
  "correlationId": "req-abc-128"
}
```

---

## 7. Rules & Constraints

### 7.1 MUST Rules

| ID | Rule |
|----|------|
| R01 | All API responses MUST use the envelope structure |
| R02 | The `success` field MUST accurately reflect the response status |
| R03 | Error responses MUST include `correlationId` for tracing |
| R04 | Error codes MUST be stable and backward-compatible |
| R05 | System errors MUST NOT expose internal details |

### 7.2 MUST NOT Rules

| ID | Rule |
|----|------|
| R06 | Controllers MUST NOT manually construct response shapes |
| R07 | Features MUST NOT define custom envelope structures |
| R08 | Ad-hoc fields MUST NOT be added outside `meta` |
| R09 | Stack traces MUST NOT appear in production responses |

### 7.3 SHOULD Rules

| ID | Rule |
|----|------|
| R10 | Responses SHOULD include `correlationId` for all requests |
| R11 | Pagination SHOULD include `total` when performant |
| R12 | Error messages SHOULD be actionable for end users |

### 7.4 Backward Compatibility

| Change Type | Allowed |
|-------------|---------|
| Add optional field to envelope | ✅ Yes |
| Add new error code | ✅ Yes |
| Remove field from envelope | ❌ No |
| Change field type | ❌ No |
| Rename error code | ❌ No |

---

## 8. Relationship to Other Documents

### 8.1 API Contract Specification

The [API Contract Specification](./api-contract-spec.md) defines:
- HTTP methods and status codes
- CQRS endpoint patterns
- Request validation rules

This document complements it by defining **response structure**.

### 8.2 Error Handling Specification

The [Error Handling Specification](./error-handling-spec.md) defines:
- Error classification logic
- Exception handling flow
- Correlation ID generation

This document defines **how errors are serialized** in responses.

### 8.3 OpenAPI / Swagger

- All response schemas MUST be documented in OpenAPI
- The envelope structure MUST be reflected in schema definitions
- Use `$ref` to share common response components

---

**Ratified**: 2026-01-18
