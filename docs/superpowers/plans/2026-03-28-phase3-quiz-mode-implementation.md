# Phase 3: Quiz Mode — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Quiz Mode as a new study type alongside Flashcard mode. Users choose mode before starting; both share the same session lifecycle but differ in card format and interaction.

**Architecture:** Unified session lifecycle with type-conditional rendering. `studyType` is already in `StudySession.create()` and persisted. The backend routes to quiz or flashcard cards at session-start time. Frontend conditionally renders `FlashcardView` or `QuizView` based on URL `mode` param.

**Tech Stack:** NestJS 11 + CQRS + MikroORM (backend), React 19 + TanStack Router + TanStack Query + Zustand (frontend)

---

## Chunk 1: Backend — Domain, DTO, and New Query

### Task 1: Add `'QUIZ'` to `StudySessionType` enum

**Files:**
- Modify: `server/src/modules/learning/study/domain/entities/study-session.entity.ts:17-21`

- [ ] **Step 1: Update `studySessionType` constant**

```typescript
export const studySessionType = {
  Flashcard: 'Flashcard',
  Quiz: 'Quiz',   // ADD
} as const;

export type StudySessionType = ObjectValues<typeof studySessionType>;
```

---

### Task 2: Add `studyType` to Start Session DTO

**Files:**
- Modify: `server/src/modules/learning/study/dto/requests/start-study-session.request.dto.ts:1-22`

The existing DTO does not have `studyType`. Add it (optional, defaults to `'FLASHCARD'` for backwards compat):

- [ ] **Step 1: Add `studyType` field to `StartStudySessionRequestDto`**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum StudyScopeDto {
  DUE = 'DUE',
  TOPIC = 'TOPIC',
}

// ADD — study type enum
export enum StudyTypeDto {
  FLASHCARD = 'FLASHCARD',
  QUIZ = 'QUIZ',
}

export class StartStudySessionRequestDto {
  @ApiProperty({ enum: StudyScopeDto, description: 'Study scope type' })
  @IsEnum(StudyScopeDto)
  scope!: StudyScopeDto;

  @ApiPropertyOptional({
    enum: StudyTypeDto,
    description: 'Study mode type (defaults to FLASHCARD)',
    default: StudyTypeDto.FLASHCARD,
  })
  @IsOptional()
  @IsEnum(StudyTypeDto)
  studyType?: StudyTypeDto;   // ADD

  @ApiPropertyOptional({
    description: 'Required when scope is TOPIC',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  topicId?: string;
}
```

---

### Task 3: Wire `studyType` through controller → command

**Files:**
- Modify: `server/src/modules/learning/study/controllers/study-session.controller.ts:50-67`

**⚠️ Important type conversion note:** `dto.studyType` is `'FLASHCARD' | 'QUIZ'` (DTO layer), but `StartStudySessionCommand.studyType` is `StudySessionType` = `'Flashcard' | 'Quiz'` (domain layer). These are incompatible string literals — you **must** map between them, not pass `dto.studyType` directly.

- [ ] **Step 1: Import `studySessionType` constant and map DTO value to domain value**

Add the import:
```typescript
import {
  studySessionScope,
  studySessionType,   // ADD
} from '../../domain/entities/study-session.entity';
```

Update the command construction in `startSession()`:
```typescript
new StartStudySessionCommand(
  user.userId,
  user.tenantId,
  dto.studyType === 'QUIZ' ? studySessionType.Quiz : studySessionType.Flashcard,
  dto.scope,
  dto.topicId,
)
```

The command constructor signature is `(userId, tenantId, studyType, scope, topicId?)`.

---

### Task 4: Create QuizCard DTO

**Files:**
- Create: `server/src/modules/learning/study/dto/responses/quiz-card.response.dto.ts`

- [ ] **Step 1: Write the DTO**

```typescript
import { ApiProperty } from '@nestjs/swagger';

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

---

### Task 5: Create `GetQuizCardsQuery`

**Files:**
- Create: `server/src/modules/learning/study/application/queries/get-quiz-cards.query.ts`

- [ ] **Step 1: Write the query class**

```typescript
import { IQuery } from '@nestjs/cqrs';

export class GetQuizCardsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly limit: number = 20,
  ) {}
}
```

---

### Task 6: Create `GetQuizCardsHandler`

**Files:**
- Create: `server/src/modules/learning/study/application/queries/get-quiz-cards.handler.ts`
- Reference: `server/src/modules/learning/study/application/queries/get-due-cards.handler.ts`
- Reference: `server/src/modules/learning/study/dto/responses/quiz-card.response.dto.ts`

**Key note:** The `EntityManager` in MikroORM supports raw SQL via `em.execute()`. The `WordSenseOrmEntity` table needs to be queried for distractors. First check what the entity is called.

- [ ] **Step 1: Read `WordSenseOrmEntity` to get table name and column names**

```bash
# Read the entity file to get the table name
```

- [ ] **Step 2: Write `GetQuizCardsHandler`**

```typescript
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';
import { UserWordSenseProgressOrmEntity } from 'src/modules/learning/progress/infrastructure/persistence/user-word-sense-progress.orm-entity';

import { GetQuizCardsQuery } from './get-quiz-cards.query';
import { QuizCardDto, QuizOptionDto } from '../../dto/responses/quiz-card.response.dto';

const LABEL_ORDER = ['A', 'B', 'C', 'D'] as const;

@QueryHandler(GetQuizCardsQuery)
export class GetQuizCardsHandler implements IQueryHandler<GetQuizCardsQuery, QuizCardDto[]> {
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetQuizCardsQuery): Promise<QuizCardDto[]> {
    const now = new Date();

    // 1. Fetch due cards (same as GetDueCardsHandler)
    const progressRows = await this.em.find(
      UserWordSenseProgressOrmEntity,
      {
        userId: query.userId,
        tenantId: query.tenantId,
        archivedAt: null,
        dueDate: { $lte: now },
      },
      {
        populate: ['wordSense', 'wordSense.word', 'wordSense.examples'],
        orderBy: { dueDate: 'ASC' },
      },
    );

    // 2. Dedupe by wordSenseId, cap at limit
    const deduped = this.dedupeByWordSense(progressRows, query.limit);

    // 3. For each card, generate 4-option quiz set
    const quizCards: QuizCardDto[] = [];

    for (const progress of deduped) {
      const sense = progress.wordSense;
      const word = sense.word;

      if (!word?.text || !sense.definition || !sense.partOfSpeech) continue;

      const correctText = `${word.text} — ${sense.definition.slice(0, 80)}`;

      // 4. Fetch 3 distractors (same POS, different id)
      const distractors = await this.fetchDistractors(
        sense.id,
        sense.partOfSpeech,
        3,
      );

      // Pad with placeholders if not enough distractors
      while (distractors.length < 3) {
        distractors.push({ id: `placeholder-${distractors.length}`, headword: 'other', definition: 'another word with this meaning' });
      }

      const distractorTexts = distractors.map(
        (d) => `${d.headword} — ${d.definition.slice(0, 80)}`,
      );

      // 5. Build options: correct + 3 distractors, shuffled
      const allOptions: { label: 'A' | 'B' | 'C' | 'D'; text: string; correct: boolean }[] = [
        { label: 'A', text: correctText, correct: true },
        ...distractorTexts.slice(0, 3).map((text, i) => ({
          label: LABEL_ORDER[i + 1] as 'A' | 'B' | 'C' | 'D',
          text,
          correct: false,
        })),
      ];

      // Shuffle options, track correct label
      const shuffled = this.shuffle([...allOptions]);
      const correctAnswer = shuffled.find((o) => o.correct)!.label;
      const options: QuizOptionDto[] = shuffled.map(({ label, text }) => ({ label, text }));

      quizCards.push({
        wordSenseId: sense.id,
        word: word.text,
        partOfSpeech: sense.partOfSpeech,
        question: word.text,
        options,
        correctAnswer,
      });
    }

    return quizCards;
  }

  private async fetchDistractors(
    targetId: string,
    partOfSpeech: string,
    count: number,
  ): Promise<{ id: string; headword: string; definition: string }[]> {
    try {
      const result = await this.em.execute(
        `SELECT ws.id, w.text as headword, ws.definition
         FROM word_sense ws
         JOIN word w ON w.id = ws.word_id
         WHERE ws.part_of_speech = :pos
           AND ws.id != :targetId
         ORDER BY RANDOM()
         LIMIT :count`,
        { pos: partOfSpeech, targetId, count },
      );
      // MikroORM execute returns rows as array of arrays
      return (result as unknown[][]).map((row) => ({
        id: row[0] as string,
        headword: row[1] as string,
        definition: row[2] as string,
      }));
    } catch {
      return [];
    }
  }

  private dedupeByWordSense(
    rows: UserWordSenseProgressOrmEntity[],
    limit: number,
  ): UserWordSenseProgressOrmEntity[] {
    const seen = new Set<string>();
    const result: UserWordSenseProgressOrmEntity[] = [];
    for (const row of rows) {
      if (!seen.has(row.wordSense.id)) {
        seen.add(row.wordSense.id);
        result.push(row);
        if (result.length >= limit) break;
      }
    }
    return result;
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
```

---

### Task 7: Update `StartStudySessionHandler` to route by `studyType`

**Files:**
- Modify: `server/src/modules/learning/study/application/commands/start-study-session.handler.ts:1-94`

The handler needs to dispatch `GetQuizCardsQuery` instead of `GetDueCardsQuery` when `studyType === 'Quiz'`.

- [ ] **Step 1: Read `StudySessionType` constant**

The `studySessionType` constant uses `'Quiz'` as value (not `'QUIZ'`). Use:
```typescript
if (command.studyType === studySessionType.Quiz) { ... }
```

- [ ] **Step 2: Add import for `GetQuizCardsQuery` and `QuizCardDto`**

```typescript
import { GetQuizCardsQuery } from '../queries/get-quiz-cards.query';
import { QuizCardDto } from '../../dto/responses/quiz-card.response.dto';
```

- [ ] **Step 3: Update the `else` branch to route by `studyType`**

Replace the `else { ... GetDueCardsQuery }` block with:

```typescript
// Determine card type based on studyType
let cards: StudyCardResponseDto[] | QuizCardDto[];
let capped = false;

if (command.studyType === studySessionType.Quiz) {
  const quizCards = await this.queryBus.execute<GetQuizCardsQuery, QuizCardDto[]>(
    new GetQuizCardsQuery(command.userId, command.tenantId),
  );
  cards = quizCards;
  capped = false; // GetQuizCardsHandler already caps at 20
} else {
  const cardsEnvelope = await this.queryBus.execute<
    GetDueCardsQuery,
    StudyCardsEnvelopeDto
  >(new GetDueCardsQuery(command.userId, command.tenantId));
  cards = cardsEnvelope.cards;
  capped = cardsEnvelope.capped;
}

const session = StudySession.create({
  userId: command.userId,
  tenantId: command.tenantId,
  scope: command.scope,
  studyType: command.studyType,
  topicId: command.scope === studySessionScope.Topic ? command.topicId! : null,
  enrolledCardIds: cards.map((card) => card.wordSenseId),
});

await this.sessionRepository.saveSession(session);
await this.em.flush();
session.publishEvents(this.logger, this.eventBus);

return {
  sessionId: session.id,
  cards,
  total: cards.length,
  capped,
};
```

The return type needs to be updated to a union. Add this type alias at the top of the handler file:

```typescript
export type StartStudySessionResponse =
  | { sessionId: string; cards: StudyCardResponseDto[]; total: number; capped: boolean }
  | { sessionId: string; cards: QuizCardDto[]; total: number; capped: boolean };
```

---

### Task 8: Register `GetQuizCardsHandler` in the module

**Files:**
- Modify: `server/src/modules/learning/study/study.module.ts`

- [ ] **Step 1: Add `GetQuizCardsHandler` to the `controllers` providers array**

```typescript
import { GetQuizCardsHandler } from './application/queries/get-quiz-cards.handler';

// In the @Module({ providers: [..., GetQuizCardsHandler] }) array
```

---

### Task 9: Build and fix any TypeScript errors

**Commands:**
```bash
cd server && npm run build 2>&1
```

Expected: build passes with zero errors. Common fixes:
- If `StudyCardResponseDto` doesn't have `wordSenseId` → check the field name in `study-card.response.dto.ts`
- If the `cards.map()` on the union type fails → cast with `as StudyCardResponseDto[]` or add type guard
- If the controller's `ApiResponse.success(result)` has a union return type → use `ApiResponse.success(result as any)` or split the return into two methods

---

## Chunk 2: Frontend — Types, Store, and Mode Selector

### Task 10: Add quiz types to `study.types.ts`

**Files:**
- Modify: `client/src/modules/learning/types/study.types.ts`

- [ ] **Step 1: Rename existing `StudyCard` to `FlashcardStudyCard` and add quiz types**

The existing `export interface StudyCard` (lines 7-19) holds flashcard fields. Rename it directly to `FlashcardStudyCard`:

```typescript
// Rename the existing interface from 'StudyCard' to 'FlashcardStudyCard':
export interface FlashcardStudyCard {
  wordSenseId: string;
  front: string;
  back: {
    definition: string;
    example: string | null;
  };
  hint: string;
  dueDate: string | null;
  isDue: boolean;
  isMastered: boolean;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
}
```

Then add all quiz types and updated types below the existing content:

```typescript
// ---------------------------------------------------------------------------
// Phase 3 — Quiz Mode
// ---------------------------------------------------------------------------

export interface QuizOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string; // "everywhere — present or found everywhere"
}

export interface QuizCard {
  wordSenseId: string;
  word: string;
  partOfSpeech: string;
  question: string;
  options: QuizOption[]; // always 4 entries, shuffled
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

// Unified card type (flashcard or quiz)
export type StudyCard = FlashcardStudyCard | QuizCard;

// Update SessionMode to include 'quiz'
export type SessionMode = 'due' | 'topic' | 'quiz';  // ADD 'quiz'

// Add StudyType (sent to API)
export type StudyType = 'FLASHCARD' | 'QUIZ';  // ADD

// Update StartSessionPayload to accept studyType
export interface StartSessionPayload {
  scope: StudyScope;
  topicId?: string;
  studyType?: StudyType;  // ADD
}

// Update StartSessionResponse to handle polymorphic cards
export interface StartSessionResponse {
  sessionId: string;
  cards: FlashcardStudyCard[] | QuizCard[];
  total: number;
  capped: boolean;
}

// Add QuizAnswer interface
export interface QuizAnswer {
  wordSenseId: string;
  selectedLabel: 'A' | 'B' | 'C' | 'D';
  correct: boolean;
  rating: 1 | 2 | 3 | 4; // 3 = correct, 1 = wrong
}
```

---

### Task 11: Add quiz state to the store

**Files:**
- Modify: `client/src/modules/learning/stores/use-study-session-store.ts`

- [ ] **Step 1: Add `quizAnswers` state and `recordQuizAnswer` action**

Add `QuizAnswer` to the imports:
```typescript
import type { QuizAnswer, QuizCard, SessionMode, StudyCard } from '../types/study.types';
```

Update the store interface:
```typescript
// Add to interface:
quizAnswers: QuizAnswer[];
recordQuizAnswer: (answer: QuizAnswer) => void;
getQuizScore: () => { correct: number; total: number; accuracy: number };
```

Update initial state:
```typescript
quizAnswers: [],
```

Add implementations after `resetSession`:
```typescript
recordQuizAnswer: (answer) =>
  set((s) => ({ quizAnswers: [...s.quizAnswers, answer] })),

getQuizScore: () => {
  const { quizAnswers } = get();
  const correct = quizAnswers.filter((a) => a.correct).length;
  return {
    correct,
    total: quizAnswers.length,
    accuracy: quizAnswers.length > 0 ? correct / quizAnswers.length : 0,
  };
},
```

Update `resetSession` to also reset `quizAnswers`:
```typescript
resetSession: () =>
  set({
    cards: [],
    currentIndex: 0,
    flipped: false,
    sessionMode: null,
    topicId: null,
    sessionId: null,
    completed: false,
    ratingBreakdown: { again: 0, hard: 0, good: 0, easy: 0 },
    reviewedCount: 0,
    startedAt: null,
    elapsedMs: 0,
    isSubmittingRating: false,
    quizAnswers: [],  // ADD
  }),
```

**Note:** Update all other store methods that reset state (e.g., `startSession`) to also reset `quizAnswers: []`.

---

### Task 12: Add mode selector to `my-learning.page.tsx`

**Files:**
- Modify: `client/src/modules/learning/pages/my-learning.page.tsx`

**⚠️ Critical fix:** `handleStartReview` must call `useStartSession` mutation instead of just navigating. The `studyType` must be sent to the backend to create a quiz session. Simply navigating with `studyType` in the URL skips the mutation call entirely.

- [ ] **Step 1: Import `useStartSession` hook**

Add to the existing import block (near the other learning imports):
```typescript
import { useStartSession } from '../hooks/use-start-session';
```

- [ ] **Step 2: Add `studyType` state and `startMutation` call**

Add state and hook:
```typescript
const [studyType, setStudyType] = useState<'FLASHCARD' | 'QUIZ'>('FLASHCARD');
const startMutation = useStartSession();
```

Update `handleStartReview` to call the mutation (not just navigate):
```typescript
const handleStartReview = () => {
  // Always pass 'DUE' scope — studyType determines quiz vs flashcard
  startMutation.mutate({ scope: 'DUE', studyType });
};
```

The `useStartSession` hook's `onSuccess` already handles navigation — it reads `payload.studyType` and sets `search.mode = 'quiz'` or `'due'`, then navigates to `/_/learning/study?sessionId=...&mode=quiz`. No manual navigation needed here.

**Note for Task 13:** `use-start-session.ts` must be updated so its `onSuccess` handler reads `payload.studyType` to determine the URL `mode`. That update is in Task 13.

- [ ] **Step 3: Add mode toggle to the "Start Review" card**

Add a segmented control between the description and the button area:

```tsx
{/* Inside the "Start Review" card, after the description text */}
<div className="flex items-center gap-2">
  <span className="text-sm text-muted-foreground">Mode:</span>
  <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
    <button
      type="button"
      onClick={() => setStudyType('FLASHCARD')}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${
        studyType === 'FLASHCARD'
          ? 'bg-background text-foreground shadow-sm font-medium'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Flashcard
    </button>
    <button
      type="button"
      onClick={() => setStudyType('QUIZ')}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${
        studyType === 'QUIZ'
          ? 'bg-background text-foreground shadow-sm font-medium'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      Quiz
    </button>
  </div>
</div>
```

---

### Task 13: Update `use-start-session` hook to pass `studyType`

**Files:**
- Modify: `client/src/modules/learning/hooks/use-start-session.ts`

- [ ] **Step 1: Update `StartSessionPayload` usage and navigation**

The `StartSessionPayload` type now accepts `studyType`. Pass it through:
```typescript
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: studyKeys.due() });

  const search: Record<string, string> = {
    sessionId: data.sessionId,
  };

  if (payload.scope === 'TOPIC' && payload.topicId) {
    search.mode = 'topic';
    search.topicId = payload.topicId;
  } else {
    // Determine mode from studyType
    search.mode = payload.studyType === 'QUIZ' ? 'quiz' : 'due';
  }

  navigate({
    to: '/_/learning/study',
    search,
    replace: true,
  });
},
```

Also update the `payload.scope === 'TOPIC'` else to not always use `'due'` for non-topic:
```typescript
if (payload.scope === 'TOPIC' && payload.topicId) {
  search.mode = 'topic';
  search.topicId = payload.topicId;
} else if (payload.studyType === 'QUIZ') {
  search.mode = 'quiz';
} else {
  search.mode = 'due';
}
```

**Important:** Also update `StartSessionPayload` import — `StudyScope` is still used but now `StudyType` is also imported:
```typescript
import type { StartSessionPayload, StartSessionResponse, StudyScope, StudyType } from '../types/study.types';
```

The `payload.studyType` access needs `StudyType` to be defined — confirm `StudyType` was added to `study.types.ts` in Task 10.

---

### Task 14: Client build check

**Commands:**
```bash
cd client && npm run build 2>&1
```

Expected: build passes. Common fixes:
- `StudyCard` type changes → update all usages
- `SessionMode` union mismatch → update route types
- Quiz option label types (`'A' | 'B' | 'C' | 'D'`) → ensure no `string` assignments

---

## Chunk 3: Frontend — QuizView Component and Page Integration

### Task 15: Create `QuizView` component

**Files:**
- Create: `client/src/modules/learning/components/quiz-view.tsx`

**Design notes:**
- Follow the same visual language as `FlashcardView` and `RatingButtons`
- Use Tailwind CSS 4 (existing project convention)
- Use Radix UI primitives where applicable (e.g., `RadioGroup` or simple `button` elements for options)
- Use Motion for animations

- [ ] **Step 1: Write `QuizView` component**

```tsx
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { StudyProgress } from './study-progress';
import type { QuizCard } from '../types/study.types';

interface QuizViewProps {
  cards: QuizCard[];
  sessionId: string;
  onComplete: () => void;
  onAnswer: (wordSenseId: string, rating: 1 | 2 | 3 | 4) => Promise<void>; // ADD
}

type QuizState = 'selecting' | 'answered';

export function QuizView({ cards, sessionId, onComplete, onAnswer }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('selecting');
  const [selectedLabel, setSelectedLabel] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex >= cards.length - 1;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleSelectOption = (label: 'A' | 'B' | 'C' | 'D') => {
    if (quizState !== 'selecting') return;
    setSelectedLabel(label);
    setQuizState('answered');

    // Map answer to rating (correct=3, wrong=1) and call onAnswer
    const correct = label === currentCard.correctAnswer;
    const rating: 1 | 2 | 3 | 4 = correct ? 3 : 1;
    onAnswer(currentCard.wordSenseId, rating).catch(() => {});
  };

  const advance = () => {
    setQuizState('selecting');
    setSelectedLabel(null);

    if (isLastCard) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  // Auto-advance after 1200ms feedback
  useEffect(() => {
    if (quizState !== 'answered') return;

    feedbackTimerRef.current = setTimeout(() => {
      advance();
    }, 1200);

    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [quizState, currentIndex]);

  // Keyboard shortcuts: 1/2/3/4 → A/B/C/D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizState !== 'selecting') return;
      const keyMap: Record<string, 'A' | 'B' | 'C' | 'D'> = {
        '1': 'A', '2': 'B', '3': 'C', '4': 'D',
      };
      const label = keyMap[e.key];
      if (label) handleSelectOption(label);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizState]);

  const isCorrect = selectedLabel === currentCard.correctAnswer;

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">No cards due for quiz</h2>
          <p className="text-muted-foreground">Come back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-180px)] w-full max-w-3xl flex-col items-center justify-center gap-8 py-8 mx-auto px-4">
      {/* Header with progress */}
      <div className="flex w-full items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Quiz Mode
        </div>
        <StudyProgress current={currentIndex + 1} total={cards.length} />
        <div className="w-16" /> {/* Spacer for alignment */}
      </div>

      {/* Question */}
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
          {currentCard.question}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {currentCard.partOfSpeech}
        </p>
      </div>

      {/* Options */}
      <div className="flex w-full flex-col gap-3">
        {currentCard.options.map((option) => {
          const isSelected = option.label === selectedLabel;
          const isCorrectOption = option.label === currentCard.correctAnswer;
          const showAsCorrect = quizState === 'answered' && isCorrectOption;
          const showAsWrong = quizState === 'answered' && isSelected && !isCorrectOption;
          const dimmed = quizState === 'answered' && !isSelected && !isCorrectOption;

          let optionClass =
            'w-full rounded-xl border-2 p-4 text-left transition-all flex items-start gap-3 cursor-pointer';

          if (showAsCorrect) {
            optionClass += ' border-green-500 bg-green-50 dark:bg-green-950/30';
          } else if (showAsWrong) {
            optionClass += ' border-red-500 bg-red-50 dark:bg-red-950/30';
          } else if (dimmed) {
            optionClass += ' border-border bg-muted/30 opacity-50';
          } else if (quizState === 'selecting') {
            optionClass += ' border-border bg-card hover:border-primary/50 hover:bg-muted/50 cursor-pointer';
          } else {
            optionClass += ' border-border bg-card';
          }

          return (
            <motion.button
              key={option.label}
              type="button"
              onClick={() => handleSelectOption(option.label)}
              disabled={quizState !== 'selecting'}
              className={optionClass}
              whileTap={quizState === 'selecting' ? { scale: 0.98 } : undefined}
            >
              {/* Label badge */}
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                showAsCorrect
                  ? 'bg-green-500 text-white'
                  : showAsWrong
                  ? 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {option.label}
              </span>

              {/* Option text */}
              <span className={`flex-1 text-sm leading-relaxed ${
                showAsCorrect ? 'text-green-700 dark:text-green-400' :
                showAsWrong ? 'text-red-700 dark:text-red-400' :
                'text-foreground'
              }`}>
                {option.text}
              </span>

              {/* Icon */}
              {showAsCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />}
              {showAsWrong && <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {quizState === 'answered' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-md rounded-2xl p-4 text-center ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800'
            }`}
          >
            {isCorrect ? (
              <div>
                <p className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  Correct!
                </p>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                  Press continues automatically...
                </p>
              </div>
            ) : (
              <div>
                <p className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400 font-bold">
                  <XCircle className="h-5 w-5" />
                  Incorrect
                </p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                  Correct answer: {currentCard.correctAnswer} — {currentCard.options.find(o => o.label === currentCard.correctAnswer)?.text.split(' — ')[0]}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

### Task 16: Integrate `QuizView` into `study-session.page.tsx`

**Files:**
- Modify: `client/src/modules/learning/pages/study-session.page.tsx`

**Key changes:**
1. Accept `studyType` from URL search params
2. Add `mode === 'quiz'` early return branch for `QuizView`
3. Update type casts to use `FlashcardStudyCard | QuizCard`
4. Update the review handler to call `recordQuizAnswer` when in quiz mode

- [ ] **Step 1: Import `QuizView` and quiz types**

```typescript
import { QuizView } from '../components/quiz-view';
import type { FlashcardStudyCard, QuizCard, QuizAnswer } from '../types/study.types';
```

- [ ] **Step 2: Extract `studyType` from URL search**

Update the URL search destructuring:
```typescript
const sessionId = search.sessionId as string | undefined;
const completed = search.completed === 'true';
const mode = (search.mode as 'due' | 'topic' | 'quiz') || 'due';
const studyType = (search.studyType as 'FLASHCARD' | 'QUIZ' | undefined) ?? 'FLASHCARD';
const topicId = search.topicId as string | undefined;
```

- [ ] **Step 3: Add early return for quiz mode**

Add this after the existing "show server summary if completed" check and before the "pending auto-start" useEffect:

```tsx
// Quiz mode — render QuizView
if (mode === 'quiz' && store.cards.length > 0) {
  return (
    <QuizView
      cards={store.cards as QuizCard[]}
      sessionId={sessionId!}
      onComplete={handleQuizComplete}
      onAnswer={handleQuizAnswer}
    />
  );
}
```

- [ ] **Step 4: Add `handleQuizAnswer` and `handleQuizComplete` handlers**

Both handlers need page-level state (`reviewMutation`, `store`, `completeMutation`), so they live in the page, not `QuizView`. Add after the other handler definitions:

```typescript
const handleQuizAnswer = async (wordSenseId: string, rating: 1 | 2 | 3 | 4) => {
  const startedAt = store.startedAt ?? Date.now();
  const reviewDurationMs = Date.now() - startedAt;
  await reviewMutation.mutateAsync({ wordSenseId, rating, reviewDurationMs });
  store.recordRating(rating);
};

const handleQuizComplete = () => {
  if (store.sessionId) {
    store.finishSession();
    store.setSessionCompleted();
    completeMutation.mutate(store.sessionId);
  }
};
```

- [ ] **Step 5: Update the review mutation handler for quiz mode**

The existing `handleRate` uses flashcard patterns (flip → rate → goNext). For quiz mode, the flow is different: select option → show feedback → auto-advance.

Replace the current review flow for quiz with:

```typescript
// In the auto-start useEffect, update scope determination to pass studyType
// Update: const scope: StudyScope = mode === 'topic' && topicId ? 'TOPIC' : 'DUE';
// Add studyType to the mutate call:
startMutation.mutate(
  { scope, topicId, studyType: mode === 'quiz' ? 'QUIZ' : 'FLASHCARD' },
  { onSettled: () => setPendingAutoStart(false) },
);
```

**Important:** Update `resetSession` to also reset `quizAnswers: []` (done in Task 11).

---

### Task 17: Client build check

**Commands:**
```bash
cd client && npm run build 2>&1
```

Expected: build passes with zero Phase 3 errors. Fix any TypeScript errors before proceeding.

---

## Chunk 4: Verification and Route Type Updates

### Task 18: Update TanStack Router route type for `studyType` param

**Files:**
- Modify: `client/src/router.ts` or `client/src/router/` (TanStack Router route tree)

TanStack Router uses a route tree. The `useSearch` hook on `study-session.page.tsx` reads from the route's search params. Need to add `studyType?: 'FLASHCARD' | 'QUIZ'` to the route's search schema.

- [ ] **Step 1: Find the route tree file**

```bash
find client/src -name "routeTree.gen.ts" -o -name "*.route.ts" | head -20
```

- [ ] **Step 2: Add `studyType` to the route search params**

The route file for `/learning/study` should have a search schema. Add `studyType` to it:

```typescript
// In the route file for /learning/study (likely under client/src/routes/)
// Add to the route's search type:
search: {
  sessionId?: string;
  completed?: string;
  mode?: 'due' | 'topic' | 'quiz';
  topicId?: string;
  index?: number;
  studyType?: 'FLASHCARD' | 'QUIZ';  // ADD
}
```

Regenerate the route tree:
```bash
cd client && npx tanstack-router-gen
```

If there's no `tanstack-router-gen`, the routes may be manually defined — update the `useSearch` call's generic type directly in `study-session.page.tsx`:

```typescript
// Update useSearch generic
const search = useSearch<{
  sessionId?: string;
  completed?: string;
  mode?: 'due' | 'topic' | 'quiz';
  topicId?: string;
  index?: number;
  studyType?: 'FLASHCARD' | 'QUIZ';
}>();
```

---

### Task 19: Verify full stack — server build

**Commands:**
```bash
cd server && npm run build 2>&1
```

Expected: build passes.

---

### Task 20: Verify full stack — client build

**Commands:**
```bash
cd client && npm run build 2>&1
```

Expected: build passes.

---

### Task 21: Final lint check

**Commands:**
```bash
cd server && npm run lint 2>&1 | grep -E "(quiz|Quiz)" || echo "No Phase 3 lint errors"
cd client && npm run lint 2>&1 | grep -E "(quiz|Quiz)" || echo "No Phase 3 lint errors"
```

Expected: any errors are pre-existing (not in Phase 3 files).

---

## Files Touched Summary

### Backend — New Files
| File | Purpose |
|------|---------|
| `server/src/modules/learning/study/application/queries/get-quiz-cards.query.ts` | Query class |
| `server/src/modules/learning/study/application/queries/get-quiz-cards.handler.ts` | Handler with distractor SQL |
| `server/src/modules/learning/study/dto/responses/quiz-card.response.dto.ts` | `QuizCardDto` + `QuizOptionDto` |

### Backend — Modified Files
| File | Change |
|------|--------|
| `server/src/modules/learning/study/domain/entities/study-session.entity.ts` | Add `'Quiz'` to `studySessionType` |
| `server/src/modules/learning/study/dto/requests/start-study-session.request.dto.ts` | Add `StudyTypeDto` enum + `studyType` field |
| `server/src/modules/learning/study/controllers/study-session.controller.ts` | Pass `studyType` to command |
| `server/src/modules/learning/study/application/commands/start-study-session.handler.ts` | Route by `studyType`, return union |
| `server/src/modules/learning/study/study.module.ts` | Register `GetQuizCardsHandler` |

### Frontend — New Files
| File | Purpose |
|------|---------|
| `client/src/modules/learning/components/quiz-view.tsx` | Quiz UI with states |

### Frontend — Modified Files
| File | Change |
|------|--------|
| `client/src/modules/learning/types/study.types.ts` | Add `QuizCard`, `QuizOption`, `QuizAnswer`, update `StudyCard`, `SessionMode`, `StartSessionPayload` |
| `client/src/modules/learning/stores/use-study-session-store.ts` | Add `quizAnswers`, `recordQuizAnswer`, `getQuizScore` |
| `client/src/modules/learning/pages/my-learning.page.tsx` | Add mode selector |
| `client/src/modules/learning/hooks/use-start-session.ts` | Pass `studyType` to API and URL |
| `client/src/modules/learning/pages/study-session.page.tsx` | Conditionally render `QuizView`, handle quiz answer flow |
