# Phase 3: Quiz Mode — Design Specification

**Date:** 2026-03-28
**Status:** Approved
**Author:** Claude

---

## 1. Overview

Quiz Mode is a new study type alongside Flashcard mode. Users choose their preferred mode before starting a session. Both modes share the same session lifecycle (start → review → complete) but differ in card format and interaction model.

---

## 2. User Flow

```
Learning
  → Start Study
  → Choose Mode  [Flashcard | Quiz]
  → Study (Flashcard OR Quiz)
  → Summary
```

---

## 3. Backend Changes

### 3.1 Domain

**File:** `server/src/modules/learning/study/domain/entities/study-session.entity.ts`

Add `'QUIZ'` to the `StudySessionType` enum:

```typescript
export enum StudySessionType {
  Flashcard = 'FLASHCARD',
  Quiz = 'QUIZ',  // NEW
}
```

### 3.2 Start Session Request DTO

**File:** `server/src/modules/learning/study/dto/requests/start-study-session.request.dto.ts`

Update `studyType` validation:

```typescript
@IsEnum(['FLASHCARD', 'QUIZ'])
studyType!: 'FLASHCARD' | 'QUIZ';
```

Default to `'FLASHCARD'` if not provided (backwards compat with existing calls).

### 3.3 New Query: GetQuizCardsQuery

**Files:**
- `server/src/modules/learning/study/application/queries/get-quiz-cards.query.ts`
- `server/src/modules/learning/study/application/queries/get-quiz-cards.handler.ts`

**Handler logic:**

1. Fetch due cards (reuse `UserWordSenseProgressOrmEntity` query, same as `GetDueCardsHandler`)
2. For each card, generate 3 distractors via raw SQL:
   ```sql
   SELECT id, headword, definition
   FROM word_sense
   WHERE part_of_speech = :pos
     AND id != :targetId
   ORDER BY RANDOM()
   LIMIT 3
   ```
3. Build options array: 1 correct + 3 distractors, shuffled (target inserted at random position)
4. Cap at **20 cards** per quiz session (shorter than flashcard)
5. Return `QuizCardDto[]`

**Distractor format:** `"headword — first 80 chars of definition"` (capped)

**Distractor exhaustion:** If fewer than 3 same-POS distractors exist, pad with `"other — another word with this meaning"` placeholders. Log a warning.

### 3.4 QuizCardDto

```typescript
// server/src/modules/learning/study/dto/responses/quiz-card.response.dto.ts
export class QuizOptionDto {
  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] })
  label!: 'A' | 'B' | 'C' | 'D';

  @ApiProperty({ example: 'everywhere — present or found everywhere' })
  text!: string;
}

export class QuizCardDto {
  @ApiProperty({ format: 'uuid' })
  wordSenseId!: string;

  @ApiProperty({ example: 'ubiquitous' })
  word!: string;

  @ApiProperty({ example: 'adjective' })
  partOfSpeech!: string;

  @ApiProperty({ example: 'ubiquitous' })
  question!: string;

  @ApiProperty({ type: [QuizOptionDto] })
  options!: QuizOptionDto[];

  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] })
  correctAnswer!: 'A' | 'B' | 'C' | 'D';
}
```

### 3.5 Start Session Controller

**File:** `server/src/modules/learning/study/controllers/study-session.controller.ts`

`POST /learning/study/session/start` — when `studyType === 'QUIZ'`, use `GetQuizCardsHandler` and return `QuizCardDto[]` instead of `StudyCardDto[]`.

```typescript
// Response type is union:
ApiResponse<{ sessionId: string; cards: StudyCardDto[]; total: number; capped: boolean }>
| ApiResponse<{ sessionId: string; cards: QuizCardDto[]; total: number; capped: boolean }>
```

### 3.6 Review Endpoint — No Changes

`POST /session/review` works unchanged. Frontend maps:
- **Correct answer** → `rating = 3` (good)
- **Wrong answer** → `rating = 1` (again)

FSRS scheduling is driven by the rating value only — the backend doesn't know or care whether the review came from a quiz or flashcard.

---

## 4. Frontend Changes

### 4.1 Types

**File:** `client/src/modules/learning/types/study.types.ts`

```typescript
// Quiz option
export interface QuizOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;  // "everywhere — present or found everywhere"
}

// Quiz card
export interface QuizCard {
  wordSenseId: string;
  word: string;
  partOfSpeech: string;
  question: string;
  options: QuizOption[];   // always 4 entries, shuffled
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

// Unified card type (flashcard or quiz)
export type StudyCard = FlashcardStudyCard | QuizCard;

// Session response — cards field is polymorphic
export interface StartSessionResponse {
  sessionId: string;
  cards: FlashcardStudyCard[] | QuizCard[];
  total: number;
  capped: boolean;
}

// Study mode for routing
export type StudyMode = 'due' | 'topic' | 'quiz';

// Study type sent to API
export type StudyType = 'FLASHCARD' | 'QUIZ';
```

### 4.2 Store

**File:** `client/src/modules/learning/stores/use-study-session-store.ts`

```typescript
interface QuizAnswer {
  wordSenseId: string;
  selectedLabel: 'A' | 'B' | 'C' | 'D';
  correct: boolean;
  rating: 1 | 2 | 3 | 4;  // 3 = correct, 1 = wrong
}

// state additions
quizAnswers: QuizAnswer[] = [];

// action
recordQuizAnswer(answer: QuizAnswer) {
  set((s) => ({ quizAnswers: [...s.quizAnswers, answer] }));
}

getQuizScore() {
  const { quizAnswers } = get();
  const correct = quizAnswers.filter((a) => a.correct).length;
  return { correct, total: quizAnswers.length, accuracy: correct / quizAnswers.length };
}
```

`sessionId`, `cards`, `currentIndex` remain polymorphic (typed as `StudyCard[]`).

### 4.3 Mode Selector

**File:** `client/src/modules/learning/pages/my-learning.page.tsx`

Add a segmented mode selector to the "Start Review" entry card:

```
┌──────────────────────────────────────────┐
│  📖 Start Review                          │
│  Review your due cards                   │
│                                          │
│  Mode:  [Flashcard] [Quiz]               │
│                                          │
│  [Start Study]                           │
└──────────────────────────────────────────┘
```

On "Start Study" click:
- `POST /session/start` with `{ scope: 'DUE', studyType: 'FLASHCARD' | 'QUIZ' }`
- Navigate to `/learning/study?mode=flashcard&sessionId=...` or `/learning/study?mode=quiz&sessionId=...`

Topic mode goes to `mode=topic` as before (flashcard only for now).

### 4.4 QuizView Component

**File:** `client/src/modules/learning/components/quiz-view.tsx`

**Props:**
```typescript
interface QuizViewProps {
  cards: QuizCard[];
  sessionId: string;
  onComplete: () => void;
}
```

**Card display:**
```
┌─────────────────────────────────────────────────┐
│           ████████░░░░░░░░░  7/20                │
├─────────────────────────────────────────────────┤
│                                                 │
│              ubiquitous                         │
│                                                 │
│    ┌─────────────────────────────────────┐     │
│    │  A.  rare — occurring very infrequently │  │
│    └─────────────────────────────────────┘     │
│    ┌─────────────────────────────────────┐     │
│    │  B.  everywhere — present or found everywhere│
│    └─────────────────────────────────────┘     │
│    ┌─────────────────────────────────────┐     │
│    │  C.  temporary — lasting for a limited time │ │
│    └─────────────────────────────────────┘     │
│    ┌─────────────────────────────────────┐     │
│    │  D.  unclear — not clear or certain │     │
│    └─────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**States:**

| State | Visual |
|-------|--------|
| Selecting | All options shown, hover effect on each, cursor pointer |
| Correct | Selected option: green border + ✓. Others: dimmed. Feedback banner. 1200ms timer. |
| Wrong | Selected option: red border + ✗. Correct option: green border. Feedback banner. 1200ms timer. |

**Feedback banners:**

Correct:
```
✓ Correct!
Next review: 3 days
```

Wrong:
```
✗ Incorrect
Correct answer: B — everywhere
```

**Keyboard:** `1/2/3/4` keys select options A/B/C/D.

**On all cards answered:** Call `useCompleteSession()` → navigate to `?completed=true`.

**On empty cards:** Show empty state: "No cards due for quiz. Come back later!" with a "Go back" link.

### 4.5 Study Session Page

**File:** `client/src/modules/learning/pages/study-session.page.tsx`

Conditional render based on URL `mode` param:

```tsx
const mode = useSearch(from).mode;

return (
  <>
    {mode === 'quiz' ? (
      <QuizView
        cards={cards as QuizCard[]}
        sessionId={sessionId!}
        onComplete={handleComplete}
      />
    ) : (
      <FlashcardView
        cards={cards as FlashcardStudyCard[]}
        sessionId={sessionId!}
        onRate={handleRate}
        onComplete={handleComplete}
      />
    )}
  </>
);
```

### 4.6 API Service — No Changes

`startSession()` in `study.api.ts` already accepts `scope` + `studyType`. The response is typed as `StartSessionResponse` (polymorphic `cards` field). No new API methods needed.

### 4.7 Summary Page — No Changes

`SessionCompleteCard` renders `ratingBreakdown` + accuracy from the backend `SessionSummary`. Aggregation is study-type agnostic — quiz reviews produce the same data shape as flashcard reviews.

---

## 5. Error Handling

| Scenario | Handling |
|----------|----------|
| No due cards for quiz | Return `{ cards: [], total: 0, capped: false }`. Frontend shows empty state. |
| < 3 same-POS distractors available | Pad with `"other — another word with this meaning"` placeholders. Log warning. |
| Duplicate review (same card answered twice) | `ConflictException` from DB constraint → `StudySessionReviewHandler` already handles this. |
| Session resume on refresh | Restart from beginning (same as flashcard behavior). |

---

## 6. Files Summary

### Backend (new files)
- `server/src/modules/learning/study/application/queries/get-quiz-cards.query.ts`
- `server/src/modules/learning/study/application/queries/get-quiz-cards.handler.ts`
- `server/src/modules/learning/study/dto/responses/quiz-card.response.dto.ts`

### Backend (modified files)
- `server/src/modules/learning/study/domain/entities/study-session.entity.ts` — add `'QUIZ'`
- `server/src/modules/learning/study/dto/requests/start-study-session.request.dto.ts` — update enum
- `server/src/modules/learning/study/controllers/study-session.controller.ts` — wire quiz path
- `server/src/modules/learning/study/study.module.ts` — register `GetQuizCardsHandler`

### Frontend (new files)
- `client/src/modules/learning/components/quiz-view.tsx`

### Frontend (modified files)
- `client/src/modules/learning/types/study.types.ts` — add quiz types
- `client/src/modules/learning/stores/use-study-session-store.ts` — add quiz state
- `client/src/modules/learning/pages/my-learning.page.tsx` — add mode selector
- `client/src/modules/learning/pages/study-session.page.tsx` — conditional render

---

## 7. Out of Scope

- Quiz mode for topic scope (quiz only works with `scope: DUE` for now)
- Leaderboards or scoring persistence beyond `StudyReviewLog`
- Timer or speed-based scoring
- Partial session save/resume
- Quiz-specific summary metrics (accuracy already surfaced via existing summary)
