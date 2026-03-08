# Feature Specification: Topic Feature

**Feature Branch**: `006-topic-feature`  
**Created**: 2026-03-08  
**Status**: Draft  

## Clarifications
### Session 2026-03-08
- Q: Topic Update & Deletion Scope → A: Include Update and Delete - Add full edit and delete topic endpoints.
- Q: Topic Words Pagination & Scale → A: Paginated Words Endpoint - `GET /api/v1/topics/{id}` returns ONLY topic metadata. A separate endpoint handles paginated fetching of the words.
- Q: Data Limits & Constraints → A: Yes, set standard limits - Define explicit limits (e.g., max 50 topics/user, max 200 words/topic) in the spec constraints.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Manage Vocabulary Topics (Priority: P1)

As a learner, I want to create custom topics so that I can organize my vocabulary into logical groups (e.g., "IELTS Vocabulary", "Travel Phrases").

**Why this priority**: Creating and viewing topics is the foundational capability that enables all other topic-related features. Without ways to organize words into lists, learners can't customize their learning experience.

**Independent Test**: Can be tested by creating a new topic with a name and optional description, then verifying it appears in the user's list of topics.

**Acceptance Scenarios**:

1. **Given** a learner is on the topics page, **When** they submit a valid topic name and description, **Then** a new topic is created and they see it in their topic list.
2. **Given** a learner is creating a topic, **When** they provide a name but no description, **Then** the topic is created successfully.
3. **Given** a learner is viewing their topics, **When** they click on a specific topic, **Then** they see the topic metadata (name, description, etc.).
4. **Given** a learner is viewing a specific topic's details, **When** they scroll or navigate through the words list, **Then** the words are fetched and displayed in a paginated manner.

---

### User Story 2 - Add Words to Topics (Priority: P1)

As a learner, I want to add specific word senses (meanings of words) to my topics so that I can focus my learning on relevant vocabulary.

**Why this priority**: A topic is useless without the ability to add words to it. This connects the dictionary module to the learning module.

**Independent Test**: Can be tested by taking an existing dictionary word sense and adding it to an existing topic, making sure it now appears when viewing the topic's contents.

**Acceptance Scenarios**:

1. **Given** a learner has a topic and a word sense, **When** they add the word sense to the topic, **Then** the word is successfully added to the topic with a "NEW" learning status.
2. **Given** a learner has already added a specific word sense to a topic, **When** they attempt to add the exact same word sense to the same topic again, **Then** the system prevents duplicates and informs the user.

---

### User Story 3 - Remove Words from Topics (Priority: P2)

As a learner, I want to remove words from my topics so that I can keep my lists relevant and uncluttered as my learning goals change.

**Why this priority**: Important for list maintenance, but secondary to the core ability to create lists and add to them.

**Independent Test**: Can be tested by removing an existing word from a topic and verifying it no longer appears in that topic's word list.

**Acceptance Scenarios**:

1. **Given** a topic containing a word sense, **When** the learner removes the word, **Then** the word is successfully removed from the topic.

---

### User Story 4 - Update and Delete Topics (Priority: P2)

As a learner, I want to update the name/description of my topics or delete them entirely so that I can maintain an organized and up-to-date learning space.

**Why this priority**: Essential for list maintenance and correcting mistakes, supporting long-term engagement.

**Independent Test**: Can be tested by editing an existing topic's name and saving, then verifying the changes; and by deleting a topic and verifying it is removed from the user's list.

**Acceptance Scenarios**:

1. **Given** an existing topic, **When** a learner updates its name and description, **Then** the topic's details are updated.
2. **Given** an existing topic, **When** a learner deletes it, **Then** the topic and all its word associations are removed from the system.

---

### Edge Cases

- What happens when a user attempts to create a topic with a name that is empty or just whitespace?
- How does the system handle an attempt to add a word to a topic that has since been deleted?
- What happens if a user tries to remove a word from a topic, but the word is not in that topic?

### Dependencies & Assumptions

- **Dictionary Module**: This feature strongly depends on the existing dictionary module, specifically the existence of Word Senses that can be referenced.
- **Authentication**: Assumes users are authenticated and identified by a unique user ID, and the application uses multi-tenancy (tenant ID).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new vocabulary topic with a name and an optional description.
- **FR-002**: System MUST allow users to view a paginated list of all their created topics.
- **FR-003**: System MUST allow users to view the metadata of a specific topic.
- **FR-004**: System MUST allow users to view a paginated list of all words added to a specific topic.
- **FR-005**: System MUST allow users to add a specific word sense from the dictionary to a topic.
- **FR-005**: System MUST automatically assign an initial learning status to newly added words in a topic.
- **FR-006**: System MUST prevent the same word sense from being added to the same topic multiple times.
- **FR-007**: System MUST allow users to remove a previously added word from a topic.
- **FR-008**: System MUST isolate topics per user so that a user only sees and modifies their own topics.
- **FR-009**: System MUST allow users to update the name and description of an existing topic they own.
- **FR-010**: System MUST allow users to delete an existing topic they own, which cascades to remove all words within that topic.
- **FR-011**: System MUST restrict users to a maximum of 50 topics per user.
- **FR-012**: System MUST restrict users to a maximum of 200 words per topic.

### Key Entities *(include if feature involves data)*

- **Topic**: Represents a user-created vocabulary list. Contains a name, an optional description, and belongs to a specific user.
- **Topic Word**: Represents the association between a Topic and a specific Word Sense from the dictionary. Tracks the user's learning status for that word within the topic and when it was added.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully create topics and view their topic lists without functional errors.
- **SC-002**: Users can seamlessly add words from the dictionary into their topics, verified by the word appearing in the topic's detail view.
- **SC-003**: Topic detail views accurately display all associated words and their current learning statuses.
