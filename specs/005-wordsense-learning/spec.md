# Feature Specification: WordSense Learning

**Feature Branch**: `005-wordsense-learning`  
**Created**: 2026-03-06  
**Status**: Draft  
**Input**: User description: "Search WordSenses from Dictionary, view details, and add to learning list"

## Clarifications

### Session 2026-03-06

- Q: Can users remove a WordSense from their learning list? → A: Yes, soft delete — progress is archived but hidden from the active learning list. Users can re-add later, which restores the archived progress.
- Q: Does search require authentication? → A: No. Search and View Details are public (no login required). Only Add to Learning and Remove from Learning require authentication.
- Q: How should search trigger? → A: As-you-type with debounce (~300ms). Results update dynamically as the user types.
- Q: Is there a maximum number of WordSenses a user can add? → A: No hard limit. Users can add unlimited senses; pagination handles large lists.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search for WordSenses (Priority: P1)

As a learner, I want to search for English words and see all their meanings (senses) so I can understand the different usages of a word before deciding what to learn.

**Why this priority**: Searching is the entry point to the entire feature. Without search, users cannot discover or interact with vocabulary.

**Independent Test**: Can be fully tested by typing a word (e.g., "book") into the search box and verifying that results display multiple senses grouped by word with part of speech, definition, and CEFR level.

**Acceptance Scenarios**:

1. **Given** a learner is on the dictionary search page, **When** they type "book", **Then** after a brief debounce (~300ms) the system returns a list of WordSenses matching "book" (e.g., noun: "a set of pages", verb: "to reserve").
2. **Given** a learner searches for "boo", **When** results are returned, **Then** partial matches like "book", "booklet", "boom" appear ranked by relevance.
3. **Given** a learner searches for a word with no matches (e.g., "xyzabc"), **When** results are returned, **Then** the system displays a friendly "no results found" message.
4. **Given** many results match, **When** the first page of results is shown, **Then** the user can paginate through additional results (default 20 per page).

---

### User Story 2 - View WordSense Details (Priority: P1)

As a learner, I want to tap on a specific WordSense to view its full details (definition, examples, pronunciation, CEFR level, synonyms) so I can understand the word deeply before adding it.

**Why this priority**: Viewing details is essential for informed learning decisions. A learner must understand a sense before committing to learn it.

**Independent Test**: Can be fully tested by selecting a WordSense from search results and verifying full detail data (definition, short definition, examples, CEFR level, synonyms, antonyms, pronunciation audio) are displayed.

**Acceptance Scenarios**:

1. **Given** a search result listing, **When** the learner selects "book (noun)", **Then** the system displays the full details including definition, examples, CEFR level, synonyms, antonyms, and pronunciation.
2. **Given** a WordSense has audio pronunciation, **When** viewing details, **Then** the learner can play the audio.
3. **Given** a WordSense has no examples, **When** viewing details, **Then** the examples section is hidden gracefully.

---

### User Story 3 - Add a WordSense to Learning List (Priority: P1)

As a learner, I want to click "Add to Learning" on a WordSense so I can track my progress on that specific meaning.

**Why this priority**: This is the core action of the feature — connecting the Dictionary domain with the Learning domain.

**Independent Test**: Can be fully tested by clicking "Add to Learning" on a WordSense and verifying that a UserWordSenseProgress record is created. Refreshing the page should show the sense as "already learning".

**Acceptance Scenarios**:

1. **Given** a learner views a WordSense they have not yet added, **When** they click "Add to Learning", **Then** the system creates a new UserWordSenseProgress with initial mastery level, and the button changes to indicate it was added.
2. **Given** a learner has already added a WordSense, **When** they view that WordSense again, **Then** the button shows "Already Learning" (or similar) instead of "Add to Learning".
3. **Given** a learner tries to add the same WordSense again (e.g., via race condition or duplicate click), **When** the request is processed, **Then** the system does not create a duplicate — it returns the existing progress.
4. **Given** a learner is not authenticated, **When** they click "Add to Learning", **Then** the system prompts them to log in first.

---

### User Story 4 - View Learning List (Priority: P2)

As a learner, I want to see all the WordSenses I've added to my learning list so I can review what I'm studying.

**Why this priority**: After adding senses, users need a way to see and manage their learning queue. This is important but secondary to the core add flow.

**Independent Test**: Can be fully tested by navigating to "My Learning" page and verifying all previously added WordSenses appear with their current learning state.

**Acceptance Scenarios**:

1. **Given** a learner has added 5 WordSenses, **When** they navigate to their learning list, **Then** all 5 appear with word text, part of speech, definition summary, and current mastery level.
2. **Given** a learner has no WordSenses in their learning list, **When** they navigate to the learning list, **Then** the system displays an empty state with a prompt to search and add words.

---

### User Story 5 - Remove a WordSense from Learning List (Priority: P2)

As a learner, I want to remove a WordSense from my learning list so I can declutter my study queue if I added something by mistake or no longer want to learn it.

**Why this priority**: Removal is a natural complement to "Add to Learning". Without it, users feel trapped and the learning list becomes unmanageable over time.

**Independent Test**: Can be fully tested by removing a previously added WordSense and verifying it no longer appears in the learning list. Re-adding it should restore the archived progress.

**Acceptance Scenarios**:

1. **Given** a learner has "book (noun)" in their learning list, **When** they click "Remove", **Then** the WordSense is soft-deleted (archived) and disappears from the active learning list.
2. **Given** a learner previously removed "book (noun)", **When** they re-add it, **Then** the system restores the archived progress instead of creating a new record.
3. **Given** a learner views a removed WordSense in dictionary search, **When** viewing details, **Then** the button shows "Add to Learning" again (not "Already Learning").

---

### Edge Cases

- What happens when a user searches an empty string? → System returns an error or prompts the user to enter at least one character.
- What happens if a Word exists in the DB but has zero WordSenses? → That word should not appear in search results.
- What happens if the same user rapidly clicks "Add to Learning" multiple times? → Only one UserWordSenseProgress record is created (idempotent operation).
- What happens if a WordSense is removed from the dictionary after a user has added it? → The user's progress entry remains but is marked/flagged as referencing a deleted sense. The system degrades gracefully.
- What happens when a user re-adds a previously removed (soft-deleted) WordSense? → The system restores the archived progress record instead of creating a new one, preserving historical review data.
- What happens when a word has 50+ senses? → Results should be paginated or grouped logically by part of speech.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow any user (authenticated or not) to search for WordSenses by entering a word or partial word (minimum 1 character). Search results update as the user types with a debounce delay (~300ms) for responsiveness.
- **FR-002**: System MUST support partial matching (prefix-based) and return results ranked by relevance (exact match first, then prefix matches, then frequency-based ranking).
- **FR-003**: System MUST paginate search results with a default page size of 20 and allow navigation between pages.
- **FR-004**: System MUST display each search result with: word text, part of speech, short definition, and CEFR level (if available).
- **FR-005**: System MUST allow any user (authenticated or not) to view full details of a WordSense including: definition, short definition, CEFR level, examples, synonyms, antonyms, pronunciation (IPA and audio), idioms, and phrases.
- **FR-006**: System MUST allow authenticated users to add a WordSense to their personal learning list by creating a UserWordSenseProgress record.
- **FR-007**: System MUST prevent duplicate UserWordSenseProgress records for the same user + WordSense combination (idempotent add operation).
- **FR-008**: System MUST initialize new UserWordSenseProgress with: mastery level = 0, review count = 0, next review at = now, last reviewed at = null.
- **FR-009**: System MUST return the current learning state of a WordSense for the authenticated user (whether added or not) when viewing details.
- **FR-010**: System MUST allow authenticated users to view their personal learning list with pagination support.
- **FR-011**: System MUST treat the Dictionary domain as read-only — users cannot modify word or sense data through this feature.
- **FR-012**: System MUST allow authenticated users to remove a WordSense from their learning list via soft delete (archiving the progress record). Re-adding a previously removed sense restores the archived progress.

### Key Entities

- **Word**: A dictionary entry representing an English word with its lemma, language, source, rank, and frequency. A Word has many WordSenses and Pronunciations.
- **WordSense**: A specific meaning of a Word, characterized by part of speech, definition, CEFR level, examples, synonyms, and antonyms. This is the unit of learning.
- **UserWordSenseProgress**: Tracks a user's learning progress for a specific WordSense. Contains mastery level, review count, and spaced repetition scheduling fields (nextReviewAt, lastReviewedAt).

### Assumptions

- Authentication is already implemented; the current user's ID is available in all requests.
- The Dictionary database already contains Words and WordSenses populated from external providers.
- Search operates on persisted data in the local database, not on external provider APIs.
- The initial mastery level for newly added senses is 0 (beginner).
- Learning progress is per-user globally (not scoped to a workspace or topic in this feature).
- CEFR levels are optional — not all senses will have them.
- There is no hard limit on the number of WordSenses a user can add to their learning list. Pagination handles large lists.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can search for a word and see relevant senses in under 2 seconds.
- **SC-002**: Users can complete the full flow (search → view → add to learning) in under 30 seconds.
- **SC-003**: 95% of "Add to Learning" actions succeed on the first attempt without errors.
- **SC-004**: The system correctly prevents 100% of duplicate learning entries.
- **SC-005**: Search results are relevant — exact matches appear first above partial matches.
- **SC-006**: Users can view their learning list and find any previously added sense within 10 seconds.
