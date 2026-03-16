# Flashcard Feature Design

**Date:** 2026-03-16
**Status:** Approved

## Overview

A flashcard system for vocabulary learning integrated into the Learning section. Supports three study modes (Practice, Review, Quiz), custom card creation from dictionary or scratch, and comprehensive progress tracking.

---

## Navigation Structure

Flashcards integrated into the **Learning** section with sub-navigation:

- 📖 **Words** — Learning list (existing)
- 📚 **Topics** — Topic management (existing)
- 🎯 **Study** — Study session hub (**NEW**)
- ➕ **Create** — Flashcard creation (**NEW**)

---

## Study Hub (Entry Points)

### 1. Quick Start
- One-click to start with defaults
- Shows card count (e.g., "20 cards due for review")
- Default: 20 cards from learning list

### 2. Choose Source
- Select which cards to study:
  - "All Learning Words"
  - Specific Topic(s)

### 3. Configure (Full Options)
- **Source:** All Learning Words / Specific Topic / Custom Only
- **Mode:** Practice / Review / Quiz
- **Card Count:** Slider (10-50)

---

## Three Study Modes

### Practice Mode (Sequential)
- Cards presented in order or shuffled
- Flip card to reveal answer
- Rate: **"Know"** / **"Don't Know"**
- Tracks progress, no spaced repetition logic

### Review Mode (Spaced Repetition)
- Cards due for review based on mastery level
- Flip to reveal
- Rate: **"Again"** / **"Hard"** / **"Good"** / **"Easy"**
- Automatically calculates next review date (SM-2 style)

### Quiz Mode (Self-Test)
- See word, try to recall meaning
- Reveal answer
- Rate: **"Wrong"** / **"Correct"** / **"Easy"**
- Updates mastery based on performance

---

## Study Session UI

### Layout
- **Full Screen Focus** — One card at a time, large text, minimal distractions
- Card counter (e.g., "5 / 20")
- Exit button to end session early

### Interactions
- **Flip:** Click card or press **Space**
- **Rate:** Button clicks or keyboard (**1-4** keys)
- Optional: Arrow keys for navigation

### Card Display
- Front: Word + optional hint
- Back: Definition + translation + example sentence + notes

---

## Session End

### Summary Screen
- Cards reviewed count
- Accuracy percentage
- Time spent
- Mastery changes (cards leveled up/down)

### Continue Prompt
- "Continue studying?" with options:
  - Continue with more cards
  - Done — return to Study Hub

---

## Flashcard Creation

### Path 1: From Dictionary
- Search and select existing word from dictionary
- Auto-fills: word, definition, translation, example
- User can customize: add hint, notes, own example

### Path 2: From Scratch
- Free-form front text
- Free-form back text
- Optionally add hint/notes

### Auto-Learning
Custom cards (from scratch) are **automatically added to learning list** for mastery tracking.

---

## Progress Tracking

### Persistent Stats (Shown in UI)
- Study streak (consecutive days)
- Total cards mastered
- Total study time
- Mastery breakdown (by level)

### Session Stats (Shown at End)
- Cards reviewed
- Accuracy percentage
- Time spent
- Mastery changes

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Flip card |
| 1-4 | Rate card (mapping varies by mode) |
| Left/Right | Navigate (optional) |

---

## API Integration

### Reuse Existing
- `GET/POST/DELETE /learning/senses` — Learning list
- `GET /learning/senses/:id/state` — Mastery state

### New Endpoints Required

#### Custom Flashcards
- `GET /flashcards` — List user's custom flashcards
- `POST /flashcards` — Create custom flashcard
- `PUT /flashcards/:id` — Update flashcard
- `DELETE /flashcards/:id` — Delete flashcard

#### Study Sessions
- `POST /study/sessions` — Start a study session
- `POST /study/sessions/:id/review` — Submit a card review
- `GET /study/sessions/:id/summary` — Get session summary
- `GET /study/due` — Get cards due for review

#### Stats
- `GET /study/stats` — Get persistent study stats
- `GET /study/progress` — Get progress overview

---

## Future Extensibility (Option B)

The design supports adding "Smart Study" later:

- Automatically mix due cards + new cards
- Gradual transition from Practice → Review as cards mature
- Add "Smart" entry point in Study Hub

---

## Component List

### Pages
- `StudyPage` — Study hub with entry points
- `StudySessionPage` — Full-screen study session
- `SessionSummaryPage` — Session end summary
- `CreateFlashcardPage` — Flashcard creation form

### Components
- `StudyModeSelector` — Mode selection UI
- `SourceSelector` — Source/topic picker
- `FlashcardDisplay` — Single card display (flip animation)
- `RatingButtons` — Rating button group
- `SessionProgress` — Progress indicator
- `StudyStats` — Persistent stats display
- `FlashcardForm` — Creation/editing form
- `DictionarySearch` — Word search for creation

---

## Data Models

### Flashcard (Custom)
```typescript
interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  hint?: string;
  notes?: string;
  source: 'dictionary' | 'custom';
  wordSenseId?: string; // If from dictionary
  createdAt: string;
  updatedAt: string;
}
```

### StudySession
```typescript
interface StudySession {
  id: string;
  userId: string;
  mode: 'practice' | 'review' | 'quiz';
  source: 'learning-list' | 'topic' | 'custom';
  topicId?: string;
  cardCount: number;
  startedAt: string;
  endedAt?: string;
  status: 'in-progress' | 'completed' | 'abandoned';
}
```

### StudyStats
```typescript
interface StudyStats {
  userId: string;
  streak: number;
  totalCardsReviewed: number;
  totalStudyTimeMinutes: number;
  masteredCards: number;
  lastStudyDate?: string;
}
```

---

## Acceptance Criteria

1. ✅ Users can access Study hub from Learning section
2. ✅ Users can start session via Quick Start, Choose Source, or Configure
3. ✅ All three modes work: Practice, Review, Quiz
4. ✅ Full-screen card UI with flip animation
5. ✅ Keyboard shortcuts work (Space to flip, 1-4 to rate)
6. ✅ Session summary shows at end
7. ✅ Users can create cards from dictionary or scratch
8. ✅ Custom cards auto-added to learning list
9. ✅ Persistent stats displayed in UI
10. ✅ Design supports future "Smart Study" mode
