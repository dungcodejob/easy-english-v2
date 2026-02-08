# Feature Specification: Workspace Onboarding Wizard

**Feature Branch**: `003-workspace-onboarding`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Design and implement a Workspace Onboarding Wizard for a language-learning SaaS product"

## Clarifications

### Session 2026-02-08

- Q: Can multiple users have workspaces with the same name, or must workspace names be globally unique? → A: Workspace names are unique per user only (different users can have the same workspace name)
- Q: Can a user create and manage multiple workspaces, or is each user limited to exactly one workspace? → A: Users can create multiple workspaces and switch between them
- Q: Should the frontend store/use the non-persisted wizard fields after workspace creation, or discard them? → A: All wizard fields (workspaceType, learningGoal, level, dailyTarget, studyReminder, defaultLearningMode) should be persisted to the database via the API



## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Basic Workspace Setup (Priority: P1)

A new user who has just logged in but does not have a workspace is automatically redirected to the onboarding wizard. They complete the 4-step wizard to set up their workspace with essential information, and upon successful creation, are redirected to the dashboard.

**Why this priority**: This is the core MVP - without completing onboarding, users cannot access the main product features. This enables the fundamental user journey.

**Independent Test**: Can be fully tested by creating a new account, logging in, and completing all 4 wizard steps. Delivers a fully functional workspace for the user.

**Acceptance Scenarios**:

1. **Given** a logged-in user with no workspace, **When** they access any page, **Then** they are redirected to `/workspace/new`
2. **Given** a user on Step 1 (Basics), **When** they enter a valid workspace name, **Then** the "Next" button becomes enabled
3. **Given** a user on Step 2 (Learning Context), **When** they select a language, **Then** the "Next" button becomes enabled
4. **Given** a user on Step 4 (Review), **When** they click "Create Workspace", **Then** the system creates the workspace and redirects them to the dashboard

---

### User Story 2 - Navigate Back Through Steps (Priority: P2)

A user in the middle of the wizard realizes they made a mistake on a previous step. They navigate back without losing their entered data, make corrections, and proceed forward again.

**Why this priority**: Data preservation during navigation is essential for a smooth user experience. Users should not be penalized for reviewing their choices.

**Independent Test**: Can be tested by filling out Steps 1-3, navigating back to Step 1, verifying data is preserved, making a change, and proceeding to Step 4.

**Acceptance Scenarios**:

1. **Given** a user on Step 3, **When** they click "Back", **Then** they see Step 2 with their previously entered data intact
2. **Given** a user who modified data on Step 1 after going back, **When** they navigate forward again, **Then** their new data is preserved

---

### User Story 3 - Skip Optional Preferences (Priority: P2)

A user who wants to quickly set up their workspace skips the optional Step 3 (Preferences) and proceeds directly to the review step.

**Why this priority**: Reduces friction for users who want a quick setup. Optional steps should not block progress.

**Independent Test**: Can be tested by completing Steps 1-2, clicking "Skip" on Step 3, and verifying the wizard proceeds to Step 4 with default preference values.

**Acceptance Scenarios**:

1. **Given** a user on Step 3, **When** they click "Skip", **Then** they proceed to Step 4 with default preference values applied
2. **Given** a user who skipped Step 3, **When** they view the review summary, **Then** they see the default values for dailyTarget (10), studyReminder (false), and defaultLearningMode (FLASHCARD)

---

### User Story 4 - Handle Workspace Creation Failure (Priority: P2)

A user completes all wizard steps and clicks "Create Workspace", but the backend API returns an error. The user sees an error message and can retry or modify their input.

**Why this priority**: Error handling is critical for user trust. Users need clear feedback when something goes wrong.

**Independent Test**: Can be tested by triggering a server error (e.g., network failure simulation) and verifying the error toast appears and the user remains on Step 4.

**Acceptance Scenarios**:

1. **Given** a user clicks "Create Workspace" on Step 4, **When** the API returns an error, **Then** a toast notification displays the error message
2. **Given** an API error occurred, **When** the user remains on Step 4, **Then** they can click "Create Workspace" again to retry
3. **Given** an API error occurred, **When** the user clicks "Back", **Then** they can modify their data and try again

---

### User Story 5 - View Progress Indicator (Priority: P3)

A user sees a clear progress indicator showing which step they are on and how many steps remain, providing visual feedback throughout the wizard.

**Why this priority**: Enhances user experience by setting expectations and reducing uncertainty about the process length.

**Independent Test**: Can be tested by observing the progress bar updates as the user navigates through each step.

**Acceptance Scenarios**:

1. **Given** a user on any step, **When** they view the wizard header, **Then** they see a progress bar showing current step (1-4) out of total steps
2. **Given** a user moves between steps, **When** the step changes, **Then** the progress bar animates smoothly to reflect the new position

---

### Edge Cases

- What happens when a user enters a workspace name that exceeds maximum length (assume 100 characters)?
  - System should show inline validation error and prevent proceeding
  
- What happens when a user has a session timeout during the wizard?
  - User should be redirected to login, and upon re-login, be directed back to the wizard (data may be lost)
  
- What happens when a user directly navigates to `/workspace/new` but already has a workspace?
  - User should be redirected to the dashboard

- What happens when the user refreshes the page in the middle of the wizard?
  - Wizard state is lost; user starts from Step 1 (acceptable for MVP)

- What happens when dailyTarget is set outside the valid range (1-100)?
  - System should show inline validation error and prevent proceeding

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redirect authenticated users without a workspace to `/workspace/new` when accessing any protected route
- **FR-002**: System MUST display a 4-step wizard with clear step indicators (Basics → Learning Context → Preferences → Review)
- **FR-003**: System MUST validate required fields before allowing navigation to the next step
- **FR-004**: System MUST preserve user input when navigating between steps using Back/Next buttons
- **FR-005**: System MUST allow users to skip Step 3 (Preferences) and proceed with default values
- **FR-006**: System MUST display a summary of all collected data on Step 4 before final submission
- **FR-007**: System MUST call the backend API (`POST /workspaces`) with all workspace data upon final submission: name, description, workspaceType, language, learningGoal, level, dailyTarget, studyReminder, defaultLearningMode
- **FR-008**: System MUST redirect users to the dashboard (`/`) upon successful workspace creation
- **FR-009**: System MUST display error feedback via toast notification when workspace creation fails
- **FR-010**: System MUST show a loading state on the submit button during API request
- **FR-011**: System MUST validate workspace name is between 1 and 100 characters
- **FR-012**: System MUST validate dailyTarget is a number between 1 and 100
- **FR-013**: System MUST animate step transitions with fade and slide effects for smooth UX
- **FR-014**: System MUST show inline validation errors for invalid fields

### Key Entities

- **Workspace**: Represents a user's learning environment. Links to user's account. Users can create and manage multiple workspaces. Workspace names are unique per user.
  - `name` (string, required, 1-100 chars)
  - `description` (string, optional)
  - `workspaceType` (enum: PERSONAL | TEAM | CLASSROOM, default: PERSONAL)
  - `language` (enum: EN | VI | ES | FR | DE | JA | KO | ZH, required)
  - `learningGoal` (enum: VOCABULARY | EXAM_PREP | DAILY_PRACTICE, default: VOCABULARY)
  - `level` (enum: BEGINNER | INTERMEDIATE | ADVANCED, default: BEGINNER)
  - `dailyTarget` (number, 1-100, default: 10)
  - `studyReminder` (boolean, default: false)
  - `defaultLearningMode` (enum: FLASHCARD | QUIZ | SPACED_REPETITION, default: FLASHCARD)


## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the entire onboarding wizard (4 steps) in under 3 minutes
- **SC-002**: 90% of users successfully create a workspace on their first wizard attempt
- **SC-003**: Step transition animations complete within 300ms for smooth visual feedback
- **SC-004**: All form validation errors are displayed within 100ms of user input
- **SC-005**: Workspace creation API response is handled within 5 seconds before showing timeout error
- **SC-006**: Skip rate for Step 3 (Preferences) remains below 70%, indicating the optional step provides value
