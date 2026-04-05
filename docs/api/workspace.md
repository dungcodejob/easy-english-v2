# Workspace API

> REST API endpoints for workspace (tenant) management.

**Base URL:** `/api/v1/workspaces`
**Authentication:** JWT Bearer token required on all endpoints.

---

## 1. POST `/`

Create a new workspace.

### Request

```json
POST /api/v1/workspaces
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "English Class A",
  "description": "Classroom for English 101",
  "type": "Classroom",
  "language": "VI",
  "learningGoal": "Vocabulary",
  "level": "Intermediate",
  "dailyTarget": 30,
  "studyReminder": true,
  "defaultLearningMode": "Flashcard"
}
```

| Field | Type | Required | Enum | Description |
|-------|------|----------|------|-------------|
| `name` | string | Yes | — | Workspace name |
| `description` | string | No | — | Workspace description |
| `type` | string | Yes | `Personal`, `Team`, `Classroom` | Workspace type |
| `language` | string | Yes | `EN`, `VI`, `ES`, `FR`, `DE`, `JA`, `KO`, `ZH` | Native language |
| `learningGoal` | string | Yes | `Vocabulary`, `ExamPrep`, `DailyPractice` | Learning goal |
| `level` | string | Yes | `Beginner`, `Intermediate`, `Advanced` | Proficiency level |
| `dailyTarget` | number | Yes | — | Daily card target |
| `studyReminder` | boolean | Yes | — | Enable study reminders |
| `defaultLearningMode` | string | Yes | `Flashcard`, `Quiz`, `SpacedRepetition` | Default study mode |

### Response

**201 Created**

```json
{
  "data": {
    "id": "uuid",
    "name": "English Class A",
    "description": "Classroom for English 101",
    "type": "Classroom",
    "language": "VI",
    "learningGoal": "Vocabulary",
    "level": "Intermediate",
    "dailyTarget": 30,
    "studyReminder": true,
    "defaultLearningMode": "Flashcard",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "updatedAt": "2026-04-05T00:00:00.000Z"
  }
}
```

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `400` | `VALIDATION_ERROR` | Invalid enum value or missing required field |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT |

---

## 2. GET `/`

List all workspaces the authenticated user belongs to.

### Request

```json
GET /api/v1/workspaces
Authorization: Bearer <access_token>
```

No query parameters.

### Response

**200 OK**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Personal Workspace",
      "description": null,
      "type": "Personal",
      "language": "VI",
      "learningGoal": "Vocabulary",
      "level": "Intermediate",
      "dailyTarget": 20,
      "studyReminder": false,
      "defaultLearningMode": "Flashcard",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "name": "English Class A",
      "type": "Classroom",
      "...": "..."
    }
  ]
}
```

Returns all workspaces across all roles (owner, admin, member).

---

## 3. GET `/check`

Check whether the authenticated user has at least one workspace.

### Request

```json
GET /api/v1/workspaces/check
Authorization: Bearer <access_token>
```

### Response

**200 OK**

```json
{
  "data": {
    "hasWorkspace": true
  }
}
```

Used by the client to determine whether to redirect to the workspace onboarding wizard.

---

## 4. GET `/:id`

Get a single workspace by ID.

### Request

```json
GET /api/v1/workspaces/:id
Authorization: Bearer <access_token>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Workspace ID |

### Response

**200 OK**

```json
{
  "data": {
    "id": "uuid",
    "name": "English Class A",
    "description": "Classroom for English 101",
    "type": "Classroom",
    "language": "VI",
    "learningGoal": "Vocabulary",
    "level": "Intermediate",
    "dailyTarget": 30,
    "studyReminder": true,
    "defaultLearningMode": "Flashcard",
    "createdAt": "2026-04-05T00:00:00.000Z",
    "updatedAt": "2026-04-05T00:00:00.000Z"
  }
}
```

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `401` | `UNAUTHORIZED` | Missing or invalid JWT |
| `403` | `FORBIDDEN` | User does not belong to this workspace |
| `404` | `NOT_FOUND` | Workspace does not exist |

---

## 5. Common Response Envelope

All responses follow the standard envelope:

```typescript
interface ApiResponse<T> {
  data: T;
}
```

All endpoints require JWT Bearer authentication:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
      "field": "language",
      "message": "language must be one of: EN, VI, ES, FR, DE, JA, KO, ZH"
    }
  ]
}
```
