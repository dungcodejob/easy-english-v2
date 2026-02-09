# Quickstart: Dictionary Lookup

**Date**: 2026-02-10 | **Plan**: [plan.md](file:///e:/Projects/multi-tenant/easy-english-v2/specs/4-dictionary-lookup/plan.md)

---

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for memory cache)
- Valid AzVocab API key

---

## Environment Setup

Add to `.env`:

```bash
# AzVocab Provider
AZVOCAB_API_URL=https://azvocab.com/api/v1
AZVOCAB_API_KEY=your-api-key-here
AZVOCAB_TIMEOUT_MS=5000

# Cache Configuration
PROVIDER_CACHE_TTL_DAYS=90
PROVIDER_CACHE_404_TTL_HOURS=24
MEMORY_CACHE_TTL_SECONDS=300
```

---

## API Usage

### Lookup a Word

```bash
# With JWT token
curl -X GET "http://localhost:3000/api/v1/dictionary/lookup/hello" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "text": "hello",
    "normalizedText": "hello",
    "language": "en",
    "source": "internal",
    "rank": 150,
    "frequency": 0.95,
    "pronunciations": [
      {
        "ipa": "/həˈloʊ/",
        "audioUrl": "https://cdn.example.com/audio/hello-us.mp3",
        "region": "US"
      }
    ],
    "senses": [
      {
        "partOfSpeech": "interjection",
        "definition": "Used as a greeting or to begin a phone conversation.",
        "shortDefinition": "A greeting",
        "cefrLevel": "A1",
        "examples": [
          {
            "text": "Hello, how are you?",
            "translationVi": "Xin chào, bạn khỏe không?"
          }
        ],
        "synonyms": ["hi", "hey"],
        "antonyms": ["goodbye"],
        "definitionVi": "Dùng để chào hỏi."
      }
    ]
  },
  "message": null,
  "timestamp": "2026-02-10T00:30:00.000Z"
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid word input |
| 401 | `UNAUTHORIZED` | Missing/invalid JWT |
| 404 | `NOT_FOUND` | Word not found |
| 503 | `SERVICE_UNAVAILABLE` | External provider down |

---

## Frontend Integration

### TanStack Query Hook

```typescript
// hooks/use-lookup-word.ts
import { useQuery } from '@tanstack/react-query';
import { dictionaryApi } from '../services/dictionary.api';

export function useLookupWord(word: string | null) {
  return useQuery({
    queryKey: ['dictionary', 'lookup', word],
    queryFn: () => dictionaryApi.lookup(word!),
    enabled: !!word && word.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### API Service

```typescript
// services/dictionary.api.ts
import { apiClient } from '@/shared/api/client';
import type { WordSnapshot } from '../types';

export const dictionaryApi = {
  lookup: async (word: string): Promise<WordSnapshot> => {
    const response = await apiClient.get(`/dictionary/lookup/${encodeURIComponent(word)}`);
    return response.data.data;
  },
};
```

### Usage in Component

```tsx
function WordLookup() {
  const [searchWord, setSearchWord] = useState('');
  const { data: word, isLoading, error } = useLookupWord(searchWord);

  return (
    <div>
      <Input 
        placeholder="Search word..." 
        onChange={(e) => setSearchWord(e.target.value)}
      />
      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error.message} />}
      {word && <WordDefinitionCard word={word} />}
    </div>
  );
}
```

---

## Debugging

### Check Provider Cache

```sql
-- View cached responses
SELECT normalized_word, provider, http_status, created_at, expires_at
FROM provider_response_cache
ORDER BY created_at DESC
LIMIT 10;

-- Clear expired cache
DELETE FROM provider_response_cache
WHERE expires_at < NOW();
```

### View Logs

```bash
# Filter dictionary module logs
pnpm --filter server dev 2>&1 | grep "dictionary"
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| 401 on all requests | Check JWT token validity |
| 503 Service Unavailable | Verify AzVocab API key and connectivity |
| Slow first lookup | Normal - cold cache, subsequent lookups faster |
| Word not found | Try alternative spellings; check if word exists in any source |
