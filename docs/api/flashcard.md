# Flashcard API

> REST API endpoints for user-created flashcard management.

**Base URL:** `/api/v1/flashcards`
**Authentication:** JWT Bearer token required on all endpoints.

---

## 1. GET `/`

List all flashcards for the authenticated user's current workspace.

### Request

```json
GET /api/v1/flashcards
Authorization: Bearer <access_token>
```

All flashcards are tenant-scoped via `workspaceId` from the JWT. No query parameters.

### Response

**200 OK**

```json
{
  "data": [
    {
      "id": "uuid",
      "front": "Hello",
      "back": "Xin chào",
      "hint": "Greeting",
      "notes": "Common greeting",
      "source": "custom",
      "wordSenseId": null,
      "createdAt": "2026-04-05T00:00:00.000Z",
      "updatedAt": "2026-04-05T00:00:00.000Z",
      "state": "New",
      "dueDate": "2026-04-05T00:00:00.000Z"
    }
  ]
}
```

### Flashcard Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Flashcard identifier |
| `front` | string | Card front text (max 500 chars) |
| `back` | string | Card back text (max 1000 chars) |
| `hint` | string? | Optional hint |
| `notes` | string? | Optional notes (max 1000 chars) |
| `source` | `dictionary` \| `custom` | Card creation source |
| `wordSenseId` | UUID? | Link to dictionary word (if source = dictionary) |
| `createdAt` | ISO 8601 | Creation timestamp |
| `updatedAt` | ISO 8601 | Last update timestamp |
| `state` | string | FSRS card state (`New`, `Learning`, `Review`, `Relearning`) |
| `dueDate` | ISO 8601 | Next scheduled review date |

---

## 2. POST `/`

Create a new flashcard.

### Request

```json
POST /api/v1/flashcards
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "front": "Hello",
  "back": "Xin chào",
  "hint": "Greeting",
  "notes": "Common greeting",
  "source": "custom"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `front` | string | Yes | Max 500 chars | Card front text |
| `back` | string | Yes | Max 1000 chars | Card back text |
| `hint` | string | No | Max 255 chars | Optional hint |
| `notes` | string | No | Max 1000 chars | Optional notes |
| `source` | string | Yes | `dictionary` \| `custom` | Creation source |
| `wordSenseId` | UUID | No | Valid UUID | Dictionary word link (required if source = dictionary) |

### Response

**201 Created**

```json
{
  "data": {
    "id": "uuid",
    "front": "Hello",
    "back": "Xin chào",
    "hint": "Greeting",
    "notes": "Common greeting",
    "source": "custom",
    "wordSenseId": null,
    "createdAt": "2026-04-05T00:00:00.000Z",
    "updatedAt": "2026-04-05T00:00:00.000Z",
    "state": "New",
    "dueDate": "2026-04-05T00:00:00.000Z"
  }
}
```

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `400` | `VALIDATION_ERROR` | Field exceeds max length or invalid enum |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT |

---

## 3. PUT `/:id`

Update an existing flashcard's content.

### Request

```json
PUT /api/v1/flashcards/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "front": "Goodbye",
  "back": "Tạm biệt",
  "hint": "Leaving",
  "notes": "Farewell greeting"
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID (path) | Flashcard ID |

All fields are optional — only provided fields are updated.

### Response

**200 OK**

```json
{
  "data": {
    "id": "uuid",
    "front": "Goodbye",
    "back": "Tạm biệt",
    "hint": "Leaving",
    "notes": "Farewell greeting",
    "source": "custom",
    "wordSenseId": null,
    "createdAt": "2026-04-05T00:00:00.000Z",
    "updatedAt": "2026-04-05T12:00:00.000Z",
    "state": "New",
    "dueDate": "2026-04-05T00:00:00.000Z"
  }
}
```

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `400` | `VALIDATION_ERROR` | Field exceeds max length |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT |
| `403` | `FORBIDDEN` | Flashcard does not belong to user's workspace |
| `404` | `NOT_FOUND` | Flashcard does not exist |

---

## 4. DELETE `/:id`

Delete a flashcard (soft delete).

### Request

```json
DELETE /api/v1/flashcards/:id
Authorization: Bearer <access_token>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID (path) | Flashcard ID |

### Response

**200 OK**

```json
{
  "data": true
}
```

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `401` | `UNAUTHORIZED` | Missing or invalid JWT |
| `403` | `FORBIDDEN` | Flashcard does not belong to user's workspace |
| `404` | `NOT_FOUND` | Flashcard does not exist |

---

## 5. Standard Response Envelope

```typescript
// Single resource
interface ApiResponse<T> {
  data: T;
}

// Collection
interface ApiListResponse<T> {
  data: T[];
}
```

---

## 6. Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "front",
      "message": "front must be a string"
    }
  ]
}
```
