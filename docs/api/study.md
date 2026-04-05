# Study API

> REST API endpoints for study sessions and card reviews.

**Base URL:** `/api/v1/learning`
**Authentication:** JWT Bearer token required on all endpoints.

---

## 1. GET `/study/due`

Get due study cards for the current user and workspace.

### Request

```json
GET /api/v1/learning/study/due
Authorization: Bearer <access_token>
```

No query parameters. Due cards are determined by `dueDate <= now()` and `state != 'reviewed'`.

### Response

**200 OK**

```json
{
  "data": {
    "cards": [
      {
        "id": "uuid",
        "front": "Hello",
        "back": "Xin chào",
        "hint": "Greeting",
        "source": "custom",
        "state": "Review",
        "dueDate": "2026-04-05T00:00:00.000Z"
      }
    ],
    "totalDue": 15,
    "newCount": 3,
    "reviewCount": 12
  }
}
```

### Due Card Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Card identifier |
| `front` | string | Card front text |
| `back` | string | Card back text |
| `hint` | string? | Optional hint |
| `source` | `dictionary` \| `custom` | Card source |
| `state` | string | FSRS card state (`New`, `Learning`, `Review`, `Relearning`) |
| `dueDate` | ISO 8601 | When the card is due |

---

## 2. GET `/study/topic/:topicId`

Get study cards for a specific topic.

### Request

```json
GET /api/v1/learning/study/topic/:topicId
Authorization: Bearer <access_token>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `topicId` | UUID (path) | Topic identifier |

### Response

**200 OK**

```json
{
  "data": {
    "cards": [
      {
        "id": "uuid",
        "front": "Hello",
        "back": "Xin chào",
        "state": "New",
        "dueDate": "2026-04-05T00:00:00.000Z"
      }
    ],
    "totalDue": 10,
    "newCount": 10,
    "reviewCount": 0
  }
}
```

### Error Cases

| Status | Code | Condition |
|--------|------|----------|
| `400` | `VALIDATION_ERROR` | Invalid topicId format |
| `401` | `UNAUTHORIZED` | Missing or invalid JWT |
| `404` | `NOT_FOUND` | Topic does not exist |

---

## 3. GET `/state`

Get the overall learning dashboard state for the current workspace.

### Request

```json
GET /api/v1/learning/state
Authorization: Bearer <access_token>
```

### Response

**200 OK**

```json
{
  "data": {
    "totalWords": 250,
    "learning": 45,
    "mastered": 180,
    "dueToday": 15,
    "streak": 7,
    "accuracy": 0.87
  }
}
```

### State Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalWords` | number | Total words in learning |
| `learning` | number | Words currently in learning phase |
| `mastered` | number | Words with stability >= 30 |
| `dueToday` | number | Cards due for review today |
| `streak` | number | Consecutive days studied |
| `accuracy` | number | Review accuracy rate (0.0–1.0) |

---

## 4. GET `/list`

List all words currently in the user's learning queue.

### Request

```json
GET /api/v1/learning/list
Authorization: Bearer <access_token>
```

### Response

**200 OK**

```json
{
  "data": {
    "items": [
      {
        "wordSenseId": "uuid",
        "word": "hello",
        "translations": ["xin chào"],
        "state": "Learning",
        "dueDate": "2026-04-05T00:00:00.000Z",
        "masteryLevel": 45
      }
    ],
    "total": 250,
    "page": 1,
    "limit": 50
  }
}
```

---

## 5. Card Review Flow

The study session flow works as follows:

```
1. Client fetches due cards:     GET /api/v1/learning/study/due
2. Client displays cards one by one
3. Client submits each review:    POST /api/v1/study/reviews
4. Client completes session:      POST /api/v1/study/sessions/complete
```

### Review Rating Scale

| Rating | Label | Description |
|--------|-------|-------------|
| `1` | Again | Failed — card lapses, reset to learning |
| `2` | Hard | Correct but difficult — short interval |
| `3` | Good | Correct — normal interval |
| `4` | Easy | Correct and effortless — long interval |

### Review Request (Dictionary-level)

```json
POST /api/v1/learning/reviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "wordSenseId": "uuid",
  "rating": 3,
  "responseTimeMs": 3500
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `wordSenseId` | UUID | Yes | Dictionary word being reviewed |
| `rating` | number (1-4) | Yes | User's rating |
| `responseTimeMs` | number | Yes | Time spent on review in milliseconds |

### Review Response

```json
{
  "data": {
    "previousState": "Review",
    "newState": "Review",
    "previousDueDate": "2026-04-05T00:00:00.000Z",
    "newDueDate": "2026-04-08T00:00:00.000Z",
    "previousStability": 2.5,
    "newStability": 4.8,
    "previousDifficulty": 0.35,
    "newDifficulty": 0.32
  }
}
```

---

## 6. Topics API

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/topics` | List all topics |
| `POST` | `/api/v1/topics` | Create a topic |
| `GET` | `/api/v1/topics/:id` | Get topic with word list |
| `PUT` | `/api/v1/topics/:id` | Update topic name |
| `DELETE` | `/api/v1/topics/:id` | Delete topic |
| `POST` | `/api/v1/topics/:id/words` | Add word to topic |
| `DELETE` | `/api/v1/topics/:id/words/:wordId` | Remove word from topic |

### Create Topic Request

```json
POST /api/v1/topics
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Unit 1 - Greetings",
  "description": "Basic greeting vocabulary"
}
```

### Add Word to Topic

```json
POST /api/v1/topics/:id/words
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "wordSenseId": "uuid"
}
```

---

## 7. Standard Error Response

```json
{
  "statusCode": 404,
  "message": "Topic not found",
  "error": "Not Found"
}
```
