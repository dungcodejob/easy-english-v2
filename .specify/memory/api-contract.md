# API Contract Specification

**Version**: 1.1.0 | **Status**: Ratified

This document defines the architecture-level rules for API design and communication between frontend and backend. All API implementations MUST conform to this specification.

---

## 1. Purpose & Scope

### 1.1 What This Contract Governs

- All HTTP APIs exposed by the backend to the frontend
- Request/response formats and conventions
- Versioning and backward compatibility rules
- Authentication and authorization contract
- Error response standards
- Multi-tenancy enforcement

### 1.2 Out of Scope

- Internal service-to-service communication
- WebSocket or real-time protocols (covered separately)
- Third-party API integrations
- Database schema or ORM implementation
- Specific endpoint documentation (covered per feature)

---

## 2. API Versioning Strategy

### 2.1 Versioning Method

- **URL-based versioning** MUST be used: `/api/v1/...`, `/api/v2/...`
- Header-based versioning MUST NOT be used for primary version selection
- All endpoints MUST include the version prefix

### 2.2 Backward Compatibility Rules

| Change Type | Allowed Without New Version |
|-------------|----------------------------|
| Adding new optional fields to response | ✅ Yes |
| Adding new optional query parameters | ✅ Yes |
| Adding new endpoints | ✅ Yes |
| Removing or renaming fields | ❌ No - Breaking |
| Changing field types | ❌ No - Breaking |
| Removing endpoints | ❌ No - Breaking |
| Changing required fields to optional | ⚠️ Evaluate case-by-case |

### 2.3 Deprecation Policy

1. **Announcement**: Deprecation MUST be announced minimum 3 months before removal
2. **Header**: Deprecated endpoints MUST include `Deprecation` header with sunset date
3. **Documentation**: Deprecation MUST be documented with migration path
4. **Sunset**: Deprecated version MAY be removed after sunset date

### 2.4 Breaking Changes

- Breaking changes MUST result in a new API version
- The old version MUST remain functional until sunset
- Frontend MUST NOT be forced to migrate immediately

---

## 3. CQRS API Rules

### 3.1 Command vs Query Distinction

| Aspect | Commands | Queries |
|--------|----------|---------|
| **Purpose** | Mutate state | Read state |
| **HTTP Methods** | `POST`, `PUT`, `PATCH`, `DELETE` | `GET` |
| **Idempotency** | MUST be idempotent for `PUT`/`DELETE` | Inherently idempotent |
| **Side Effects** | Yes | MUST NOT have side effects |

### 3.2 HTTP Method Mapping

| Operation | HTTP Method | URL Pattern |
|-----------|-------------|-------------|
| Create | `POST` | `/api/v1/{resource}` |
| Update (full) | `PUT` | `/api/v1/{resource}/{id}` |
| Update (partial) | `PATCH` | `/api/v1/{resource}/{id}` |
| Delete | `DELETE` | `/api/v1/{resource}/{id}` |
| List | `GET` | `/api/v1/{resource}` |
| Get single | `GET` | `/api/v1/{resource}/{id}` |
| Action/Command | `POST` | `/api/v1/{resource}/{id}/{action}` |

### 3.3 Command Response Rules

- Commands MUST NOT return full domain entities
- Successful commands MUST return:
  - `201 Created` with `{ id: "..." }` for create operations
  - `200 OK` or `204 No Content` for update/action operations
  - `204 No Content` for delete operations
- Commands MUST NOT return the created/updated resource (use separate GET if needed)

### 3.4 Query Response Rules

- Queries MUST return data directly
- Empty results MUST return `200 OK` with empty array/null, NOT `404`
- `404 Not Found` is reserved for non-existent resources when ID is specified

### 3.5 Idempotency

- `PUT` and `DELETE` MUST be idempotent
- `POST` commands MAY accept an idempotency key via `Idempotency-Key` header
- Replay of idempotent request MUST return same result without side effects

---

## 4. Request & Response Standards

### 4.1 Response Envelope

> **Single Source of Truth**: All response format details are defined in [API Response Schema Specification](./response-schema.md).

**Key Rules**:
- All responses MUST use the standard envelope with `success`, `data`, `correlationId`
- Paginated responses MUST include `pagination` object with `top`, `skip`, `count`, `hasMore`
- Error responses MUST include `error` object with `code`, `type`, `message`

See [response-schema.md](./response-schema.md) for complete structure, examples, and rules.

### 4.2 Pagination Contract

Pagination allows clients to retrieve large datasets in manageable chunks.
This specification follows [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) pagination semantics.

#### 4.2.1 Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `$top` | integer | 20 | Number of items to return (max: 100) |
| `$skip` | integer | 0 | Number of items to skip |
| `$count` | boolean | false | Include total count in response |

#### 4.2.2 Offset-Based Pagination

**When to use**: Traditional page-based navigation, admin dashboards, known dataset sizes.

**Request**:
```
GET /api/v1/words?$top=20&$skip=40&$count=true
```

**Response Structure**:
```json
{
  "success": true,
  "data": [ ... ],
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
| `top` | integer | Items requested |
| `skip` | integer | Items skipped |
| `count` | integer | Total count (if `$count=true`) |
| `hasMore` | boolean | More items available |

#### 4.2.3 Cursor-Based Pagination

**When to use**: Infinite scroll, real-time feeds, large or frequently changing datasets.

**Request**:
```
GET /api/v1/words?$top=20&$skiptoken=eyJpZCI6MTAwfQ==
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `$skiptoken` | string | Opaque cursor from previous response |

**Response Structure**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "top": 20,
    "nextLink": "/api/v1/words?$top=20&$skiptoken=eyJpZCI6MTIwfQ==",
    "hasMore": true
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `top` | integer | Items returned |
| `nextLink` | string \| null | Full URL for next page |
| `hasMore` | boolean | More items available |

#### 4.2.4 Selection Criteria

| Scenario | Recommended | Rationale |
|----------|-------------|-----------|
| Admin tables with page numbers | Offset (`$top` + `$skip`) | Users need "page X of Y" |
| Mobile infinite scroll | Cursor (`$skiptoken`) | Consistent ordering under changes |
| Real-time data feeds | Cursor (`$skiptoken`) | Items may be added/removed |
| Export/batch processing | Cursor (`$skiptoken`) | Handles large datasets efficiently |
| Small, static lists | Offset (`$top` + `$skip`) | Simpler implementation |

#### 4.2.5 Rules

| Rule | Description |
|------|-------------|
| Default behavior | If no pagination params, return first 20 items |
| Max page size | `$top` MUST NOT exceed 100 |
| Invalid skip | `$skip` < 0 MUST return `400 Bad Request` |
| Invalid top | `$top` < 1 or > 100 MUST return `400 Bad Request` |
| Count performance | `$count=true` MAY be expensive; endpoints MAY restrict |
| Cursor opacity | Clients MUST NOT parse or construct `$skiptoken` values |

#### 4.2.6 Error Handling

| Error Condition | HTTP Status | Error Code |
|-----------------|-------------|------------|
| Invalid `$top` value | `400 Bad Request` | `PAGINATION_INVALID_TOP` |
| Invalid `$skip` value | `400 Bad Request` | `PAGINATION_INVALID_SKIP` |
| Invalid `$skiptoken` | `400 Bad Request` | `PAGINATION_INVALID_CURSOR` |
| Count not supported | `400 Bad Request` | `PAGINATION_COUNT_NOT_SUPPORTED` |

### 4.3 Filter Expressions Contract

Filters allow clients to narrow query results using expressive filter expressions.
This specification follows [Microsoft REST API Guidelines §9.7.1](https://github.com/microsoft/api-guidelines).

#### 4.3.1 Filter Syntax

- Filters MUST be passed via the `$filter` query parameter
- Filter expressions use OData-style syntax with operators and grouping

**Example**: `?$filter=status eq 'active' and price gt 100`

#### 4.3.2 Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `status eq 'active'` |
| `ne` | Not equal | `status ne 'deleted'` |
| `gt` | Greater than | `price gt 100` |
| `ge` | Greater than or equal | `price ge 100` |
| `lt` | Less than | `price lt 500` |
| `le` | Less than or equal | `price le 500` |

#### 4.3.3 Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `and` | Logical AND | `status eq 'active' and price gt 100` |
| `or` | Logical OR | `status eq 'active' or status eq 'pending'` |
| `not` | Logical NOT | `not (status eq 'deleted')` |

#### 4.3.4 Parentheses Grouping

- Parentheses `(...)` MUST be used to control precedence
- Nested grouping is supported

**Example**: `?$filter=(status eq 'active' or status eq 'pending') and price gt 100`

#### 4.3.5 String Values

- String values MUST be enclosed in single quotes: `'value'`
- To include a single quote in a string, escape with double single quote: `'it''s'`
- String comparisons are case-sensitive by default

#### 4.3.6 Special Functions

| Function | Description | Example |
|----------|-------------|---------|
| `contains(field, 'value')` | Substring match | `contains(name, 'john')` |
| `startswith(field, 'value')` | Prefix match | `startswith(name, 'J')` |
| `endswith(field, 'value')` | Suffix match | `endswith(email, '.com')` |

#### 4.3.7 Operator Precedence

Operators are evaluated in the following order (highest to lowest):

| Priority | Operator |
|----------|----------|
| 1 | Grouping `()` |
| 2 | Logical `not` |
| 3 | Comparison `eq`, `ne`, `gt`, `ge`, `lt`, `le` |
| 4 | Logical `and` |
| 5 | Logical `or` |

#### 4.3.8 Grammar (ABNF)

```abnf
filterExpr     = orExpr
orExpr         = andExpr *( "or" andExpr )
andExpr        = notExpr *( "and" notExpr )
notExpr        = "not" notExpr / primaryExpr
primaryExpr    = "(" filterExpr ")" / comparison / functionCall
comparison     = field comparator value
comparator     = "eq" / "ne" / "gt" / "ge" / "lt" / "le"
functionCall   = functionName "(" field "," stringValue ")"
functionName   = "contains" / "startswith" / "endswith"
field          = identifier
value          = stringValue / numberValue / booleanValue / nullValue
stringValue    = "'" *char "'"
numberValue    = ["-"] 1*digit ["." 1*digit]
booleanValue   = "true" / "false"
nullValue      = "null"
```

#### 4.3.9 Examples

| Use Case | Filter Expression |
|----------|-------------------|
| Exact match | `$filter=status eq 'active'` |
| Numeric comparison | `$filter=price gt 100 and price le 500` |
| OR on same field | `$filter=status eq 'active' or status eq 'pending'` |
| AND across fields | `$filter=status eq 'active' and category eq 'electronics'` |
| Complex grouping | `$filter=(status eq 'active' or status eq 'pending') and price gt 100` |
| Negation | `$filter=not (status eq 'deleted')` |
| String function | `$filter=contains(name, 'john') and isActive eq true` |
| Date comparison | `$filter=createdAt ge '2026-01-01T00:00:00Z'` |
| Null check | `$filter=deletedAt eq null` |

#### 4.3.10 Error Handling

| Error Condition | HTTP Status | Error Code |
|-----------------|-------------|------------|
| Invalid filter syntax | `400 Bad Request` | `FILTER_SYNTAX_ERROR` |
| Unknown field name | `400 Bad Request` | `FILTER_UNKNOWN_FIELD` |
| Unsupported operator for field type | `400 Bad Request` | `FILTER_INVALID_OPERATOR` |
| Invalid value type for field | `400 Bad Request` | `FILTER_TYPE_MISMATCH` |
| Unbalanced parentheses | `400 Bad Request` | `FILTER_UNBALANCED_PARENS` |

Error response MUST include the position of the error in the expression when possible:

```json
{
  "error_code": "FILTER_SYNTAX_ERROR",
  "message": "Invalid filter expression",
  "details": [{
    "position": 15,
    "message": "Expected operator, found 'xyz'"
  }]
}
```

#### 4.3.11 Field Availability

- Each endpoint MUST document which fields are filterable
- Filtering on non-filterable fields MUST return `400 Bad Request`
- Endpoints MAY restrict certain operators for specific fields

### 4.4 Sorting Contract

Sorting defines the order of results in list/query responses.
This specification follows [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) `$orderby` semantics.

#### 4.4.1 Applicability

- Sorting MUST only be applied to **Query APIs** (read operations)
- Command APIs (POST, PUT, PATCH, DELETE) MUST NOT support sorting
- This aligns with CQRS separation of concerns

#### 4.4.2 Syntax

- Sorting MUST be passed via the `$orderby` query parameter
- Each sort entry MUST follow the format: `field direction`
- Fields and directions are space-separated
- Multiple fields are comma-separated, applied in order of precedence (first = primary)
- Supported directions: `asc` (ascending), `desc` (descending)
- If direction is omitted, `asc` MUST be assumed

| Format | Meaning |
|--------|---------|
| `$orderby=createdAt desc` | Sort by createdAt descending |
| `$orderby=lastName asc, firstName asc` | Primary: lastName, Secondary: firstName |
| `$orderby=price` | Sort by price ascending (default) |

#### 4.4.3 Determinism

- Sorting MUST be deterministic; repeated requests with the same `$orderby` MUST return results in the same order
- If no `$orderby` is specified, the default order is endpoint-specific and MUST be documented
- To guarantee determinism, endpoints SHOULD include a unique field (e.g., `id`) as a tiebreaker

#### 4.4.4 Restrictions

- Sorting is **optional**; endpoints MUST function without `$orderby`
- **OR or conditional sorting** is NOT supported and MUST NOT be implemented
- Sorting on computed or virtual fields is NOT supported unless explicitly documented
- Sorting on nested fields (e.g., `address.city`) is NOT supported unless explicitly documented

#### 4.4.5 Field Availability

- Each endpoint MUST document which fields are sortable
- Sorting on non-sortable fields MUST be rejected
- Sorting on unknown fields MUST be rejected

#### 4.4.6 Error Handling

| Error Condition | HTTP Status | Error Code |
|-----------------|-------------|------------|
| Unknown sort field | `400 Bad Request` | `SORT_UNKNOWN_FIELD` |
| Invalid sort direction | `400 Bad Request` | `SORT_INVALID_DIRECTION` |
| Non-sortable field | `400 Bad Request` | `SORT_FIELD_NOT_ALLOWED` |
| Malformed syntax | `400 Bad Request` | `SORT_SYNTAX_ERROR` |

- Errors MUST fail fast; partial sorting MUST NOT be applied
- Error response MUST identify the invalid field or direction

### 4.5 List Query Parameter Convention

When a query parameter represents a list of values:

#### 4.5.1 Preferred Format

- **Repeated keys** MUST be the preferred format:
  ```
  ?ids=1&ids=2&ids=3
  ```
- Comma-separated lists MAY be accepted but are discouraged
- Backend MUST normalize repeated parameters into arrays

#### 4.5.2 List Parameter Rules

| Rule | Description |
|------|-------------|
| Order preserved | Order of values MUST be preserved |
| Empty rejected | Empty list values MUST be rejected with `400 Bad Request` |
| Malformed rejected | Malformed list entries MUST be rejected |
| Max items | Endpoints MAY define maximum list size (default: 100) |

### 4.6 Date/Time Format

- All dates MUST use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- All dates MUST be in UTC timezone
- Frontend is responsible for timezone conversion

### 4.7 Null vs Optional Fields

- `null` indicates explicit absence of value
- Omitted field indicates "not provided" or "use default"
- Response MUST NOT omit fields that are defined in the contract
- Request MAY omit optional fields

---

## 5. DTO & Domain Separation

### 5.1 Domain Model Protection Rules

- Domain entities MUST NEVER be returned directly in API responses
- All API responses MUST use DTOs (Data Transfer Objects)
- DTOs MUST be defined in the presentation/API layer
- Domain models MUST NOT leak field names, internal IDs, or implementation details

### 5.2 Mapping Responsibilities

| Layer | Responsibility |
|-------|----------------|
| Controller | Receive request DTO, return response DTO |
| Application | Map between DTOs and domain models |
| Domain | Pure business logic, no knowledge of DTOs |

### 5.3 DTO Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Request DTO | `{Action}{Resource}Request` | `CreateUserRequest` |
| Response DTO | `{Resource}Response` | `UserResponse` |
| List Response | `{Resource}ListResponse` | `UserListResponse` |
| Command DTO | `{Action}{Resource}Command` | `RegisterUserCommand` |

---

## 6. Error Contract

> **Reference**: For detailed error classification, response format, and logging rules, see [Error Handling Specification](./error-handling.md).

This section covers only API-specific error considerations.

### 6.1 Error Code Naming Strategy

| Category | Pattern | Example |
|----------|---------|---------|
| Validation | `VALIDATION_{FIELD}_{RULE}` | `VALIDATION_EMAIL_INVALID` |
| Domain | `{DOMAIN}_{ACTION}_{ERROR}` | `USER_REGISTER_EMAIL_EXISTS` |
| System | `SYSTEM_{COMPONENT}_{ERROR}` | `SYSTEM_DATABASE_UNAVAILABLE` |

### 6.2 API-Specific Rules

- Error responses MUST include `correlation_id` matching the request's `X-Correlation-ID`
- Error codes MUST be stable across API versions
- Error messages MAY change; frontend MUST NOT rely on message text for logic
- System errors MUST return generic message: "An internal error occurred"

---

## 7. Authentication & Authorization Contract

### 7.1 Authentication Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes (protected) | `Bearer {token}` |
| `X-Tenant-ID` | Yes (multi-tenant) | Tenant identifier |

### 7.2 Authentication Rules

- All protected endpoints MUST require valid `Authorization` header
- Token validation MUST occur at API gateway or middleware level
- Expired tokens MUST return `401 Unauthorized`

### 7.3 Authorization Rules

- Authorization MUST be enforced server-side
- Frontend role/permission claims MUST NOT be trusted
- Backend MUST verify permissions from authoritative source (database/token)
- Unauthorized access attempts MUST be logged

### 7.4 Forbidden Patterns

- ❌ Trusting `role` or `permissions` sent in request body
- ❌ Client-side only authorization checks
- ❌ Exposing internal user IDs in JWT for cross-reference

---

## 8. Multi-Tenancy Rules

### 8.1 Tenant Identification

- Tenant MUST be identified via `X-Tenant-ID` header
- Tenant context MUST be validated against authenticated user
- Mismatched tenant/user MUST return `403 Forbidden`

### 8.2 Tenant Isolation Guarantees

- All data queries MUST be scoped by tenant ID
- Cross-tenant data access is FORBIDDEN
- Tenant ID MUST be included in all audit logs

### 8.3 Forbidden Patterns

- ❌ Accepting tenant ID from request body
- ❌ Allowing users to query data without tenant scope
- ❌ Sharing cached data between tenants

---

## 9. Observability Metadata

### 9.1 Required Headers

| Header | Direction | Description |
|--------|-----------|-------------|
| `X-Correlation-ID` | Request/Response | Links request to logs |
| `X-Request-ID` | Response | Unique request identifier |

### 9.2 Correlation ID Rules

- If client provides `X-Correlation-ID`, backend MUST use it
- If not provided, backend MUST generate one
- Correlation ID MUST be returned in response
- Correlation ID MUST be included in all related logs

### 9.3 Logging Requirements

- All requests MUST be logged with: correlation ID, tenant ID, user ID, endpoint, method
- All errors MUST be logged with full context
- PII MUST be masked or excluded from logs

---

## 10. Frontend Integration Rules

### 10.1 Contract Stability Guarantees

- Frontend MAY rely on documented response shapes
- Undocumented fields MAY change without notice
- Field additions are NOT breaking changes
- Field removals/renames require new API version

### 10.2 Frontend Assumptions

| Frontend MAY Assume | Frontend MUST NOT Assume |
|---------------------|--------------------------|
| Documented fields exist | Undocumented fields persist |
| Error codes are stable | Error messages are stable |
| Pagination format is consistent | Field order in responses |
| Date format is ISO 8601 UTC | Server-side timezone handling |

### 10.3 Change Communication

- Breaking changes MUST be communicated via:
  - Deprecation headers
  - Team notification (minimum 2 weeks before deployment)
  - Updated API documentation
- Non-breaking additions MAY be deployed without notice

---

## 11. Compliance

All API implementations MUST:

1. Follow URL-based versioning as defined in §2
2. Respect CQRS rules as defined in §3
3. Use standard envelope format as defined in §4
4. Never expose domain models directly (§5)
5. Use error format as defined in §6
6. Enforce server-side authorization (§7)
7. Maintain tenant isolation (§8)
8. Include observability metadata (§9)

Violations MUST be documented in the Implementation Plan with explicit justification.

---

**Ratified**: 2026-01-17
