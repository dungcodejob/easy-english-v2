# API Contracts: WordSense Learning

**Date**: 2026-03-06  
**API Version**: v1  
**Base Path**: `/api/v1`

---

## 1. Search WordSenses

**Public** — No authentication required.

```
GET /api/v1/dictionary/search?q={query}&$top={top}&$skip={skip}
```

### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `q` | query | `string` | YES | Search term (min 1 char, max 100 chars) |
| `$top` | query | `integer` | NO | Page size (default: 20, max: 50) |
| `$skip` | query | `integer` | NO | Offset (default: 0) |

### Response 200

```json
{
  "success": true,
  "data": [
    {
      "senseId": "uuid",
      "wordText": "book",
      "normalizedText": "book",
      "partOfSpeech": "noun",
      "shortDefinition": "A set of pages bound together",
      "cefrLevel": "A1"
    }
  ],
  "pagination": {
    "top": 20,
    "skip": 0,
    "count": 42,
    "hasMore": true
  }
}
```

### Response 400

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "type": "client",
    "message": "Query must be between 1 and 100 characters"
  }
}
```

---

## 2. Get WordSense Details

**Public** — No authentication required. If authenticated, includes learning state.

```
GET /api/v1/dictionary/senses/:senseId
```

### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `senseId` | path | `uuid` | YES | WordSense ID |
| `Authorization` | header | `Bearer token` | NO | Optional — includes learning state if present |

### Response 200

```json
{
  "success": true,
  "data": {
    "senseId": "uuid",
    "wordText": "book",
    "normalizedText": "book",
    "partOfSpeech": "noun",
    "definition": "A set of printed or written pages...",
    "shortDefinition": "A set of pages bound together",
    "cefrLevel": "A1",
    "definitionVi": "Sách",
    "examples": [
      {
        "text": "I read a book about history.",
        "translationVi": "Tôi đã đọc một cuốn sách về lịch sử.",
        "order": 1
      }
    ],
    "synonyms": ["volume", "publication"],
    "antonyms": [],
    "idioms": ["by the book"],
    "phrases": ["book of matches"],
    "collocations": { "pre": { "v": ["read", "write"] } },
    "pronunciations": [
      { "ipa": "/bʊk/", "audioUrl": "https://...", "region": "US" }
    ],
    "learningState": {
      "isLearning": true,
      "masteryLevel": 3,
      "reviewCount": 5,
      "nextReviewAt": "2026-03-10T00:00:00Z"
    }
  }
}
```

**Note**: `learningState` is `null` if user is not authenticated or has not added this sense.

### Response 404

```json
{
  "success": false,
  "error": {
    "code": "WORD_SENSE_NOT_FOUND",
    "type": "client",
    "message": "WordSense not found"
  }
}
```

---

## 3. Add WordSense to Learning

**Authenticated** — Requires `Bearer` token.

```
POST /api/v1/learning/senses
```

### Request Body

```json
{
  "wordSenseId": "uuid"
}
```

### Response 201 (Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

### Response 200 (Already exists — idempotent)

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "meta": {
    "alreadyLearning": true
  }
}
```

### Response 404

```json
{
  "success": false,
  "error": {
    "code": "WORD_SENSE_NOT_FOUND",
    "type": "client",
    "message": "WordSense does not exist"
  }
}
```

---

## 4. Remove WordSense from Learning

**Authenticated** — Requires `Bearer` token.

```
DELETE /api/v1/learning/senses/:senseId
```

### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `senseId` | path | `uuid` | YES | WordSense ID to remove |

### Response 200

```json
{
  "success": true,
  "data": null
}
```

### Response 404

```json
{
  "success": false,
  "error": {
    "code": "LEARNING_ENTRY_NOT_FOUND",
    "type": "client",
    "message": "This WordSense is not in your learning list"
  }
}
```

---

## 5. Get Learning List

**Authenticated** — Requires `Bearer` token.

```
GET /api/v1/learning/senses?$top={top}&$skip={skip}
```

### Request

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| `$top` | query | `integer` | NO | Page size (default: 20, max: 50) |
| `$skip` | query | `integer` | NO | Offset (default: 0) |

### Response 200

```json
{
  "success": true,
  "data": [
    {
      "progressId": "uuid",
      "wordSenseId": "uuid",
      "wordText": "book",
      "partOfSpeech": "noun",
      "shortDefinition": "A set of pages bound together",
      "cefrLevel": "A1",
      "masteryLevel": 3,
      "reviewCount": 5,
      "nextReviewAt": "2026-03-10T00:00:00Z",
      "lastReviewedAt": "2026-03-05T12:00:00Z",
      "addedAt": "2026-03-01T00:00:00Z"
    }
  ],
  "pagination": {
    "top": 20,
    "skip": 0,
    "count": 42,
    "hasMore": true
  }
}
```
