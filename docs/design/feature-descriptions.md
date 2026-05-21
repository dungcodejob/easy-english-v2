# Easy English — Feature Descriptions & User Flows
**For Google Stitch UI Generation**

---

## Feature 1: Landing Page

### What it does
The entry point of the app. Introduces the product and directs visitors to sign up or log in.

### UI Requirements
- Full-screen centered layout
- App logo + product name at top
- Headline: "Welcome to Easy English"
- Two call-to-action buttons: **Login** and **Register**
- Clean, minimal — no sidebar, no navigation

### User Flow
1. User visits the app URL
2. Sees welcome screen with two buttons
3. Clicks **Login** → goes to Login page
4. Clicks **Register** → goes to Register page

---

## Feature 2: Login

### What it does
Allows existing users to sign into their account using email/password or social login (Google etc.).

### UI Requirements
- Centered card on a neutral background
- App logo at the top of the card
- Title: "Log in to your account"
- Subtitle: "Please enter your details to log in"
- Social auth buttons row (Google, etc.)
- "or" divider
- Email input field
- Password input field with show/hide toggle
- Submit button: "Log in"
- Footer link: "Don't have an account? Sign up"

### User Flow
1. User opens the login page
2. Optionally clicks a social login button → redirected to OAuth provider → returns logged in
3. Or enters email and password
4. Clicks **Log in**
5. If no workspace exists → redirected to Workspace Wizard
6. If workspace exists → redirected to Dashboard

---

## Feature 3: Register

### What it does
Allows new users to create an account.

### UI Requirements
- Same centered card layout as Login
- App logo at top
- Title: "Create your account"
- Name input
- Email input
- Password input with strength indicator
- Confirm password input
- Submit button: "Sign up"
- Footer link: "Already have an account? Log in"

### User Flow
1. User opens the register page
2. Fills in name, email, password
3. Clicks **Sign up**
4. Account created → automatically redirected to Workspace Wizard

---

## Feature 4: Workspace Wizard (Onboarding)

### What it does
A 4-step onboarding flow that guides new users to create their first workspace. A workspace is the container for all learning data — vocabulary, topics, flashcards, progress.

### UI Requirements
- Centered card layout (no sidebar)
- Progress bar at the top showing 4 labeled steps: **Basics · Learning · Preferences · Review**
- Animated slide transition between steps
- Each step has: title, description, form fields, Back/Next buttons
- Step 3 (Preferences) has a **Skip** button
- Final step shows a summary before submitting

### Steps

**Step 1 — Basics**
- Workspace name input (required)
- Workspace type selector — 3 card options:
  - **Personal** (solo learner icon)
  - **Team** (briefcase icon)
  - **Classroom** (graduation cap icon)
- Description textarea (optional)
- Buttons: Cancel · Next Step

**Step 2 — Learning**
- Native language picker (searchable dropdown)
- Target learning language picker
- Buttons: Back · Next Step

**Step 3 — Preferences**
- Daily word goal slider or input
- Session length preference
- Notification preference toggle
- Buttons: Back · Skip · Next Step

**Step 4 — Review**
- Read-only summary of all chosen settings
- Error message if submission fails
- Buttons: Back · **Create Workspace**

### User Flow
1. After registration, user lands on the wizard
2. Fills in workspace name and picks a type (Personal/Team/Classroom)
3. Selects their native and target languages
4. Sets study preferences or skips
5. Reviews all settings on the final step
6. Clicks **Create Workspace** → workspace created → redirected to Dashboard

---

## Feature 5: Dashboard

### What it does
The home screen after login. Shows the user's daily study status, key stats, and quick links to continue learning.

### UI Requirements
- App shell layout (sidebar + top header)
- Full-width page, max content width `7xl`
- 4 distinct sections:

**Welcome Banner**
- Gradient background card spanning full width
- Personalized greeting: "Good morning, [Name]"
- Subtitle showing how many cards are due: "You have **15 cards** due for review"
- Two action buttons: **Start Review** (primary) and **Explore Topics** (outline)
- Decorative blur circles in the background

**Key Metrics Row** (3 cards in a grid)
- Streak card: fire icon, number of consecutive study days, trend text
- Words Learned card: book icon, total word count, trend text
- Accuracy card: target icon, percentage, trend text
- Each card has a colored icon badge and a small trending-up indicator

**Daily Goal Progress** (left card)
- Circular SVG progress ring showing today's completion %
- Text inside ring: "60% Completed"
- Subtitle: "12 of 20 words reviewed"

**Recent Topics** (right card, 2/3 width)
- List of last 3 studied topics
- Each row: topic icon + name + timestamp + progress bar + percentage
- "View All" link in card header

### User Flow
1. User logs in → arrives at Dashboard
2. Sees their streak, words learned, accuracy at a glance
3. Sees daily goal progress ring
4. Clicks **Start Review** → goes to Study Session
5. Clicks **Explore Topics** → goes to My Learning
6. Clicks a recent topic row → goes to Topic Detail

---

## Feature 6: My Learning

### What it does
The main learning hub. Shows the user's entire vocabulary list, how many cards are due for review, and allows them to start a study session or study a specific topic.

### UI Requirements
- App shell layout
- Max content width `4xl`, centered, `px-6 py-10`
- Page header row:
  - Left: Title "My Learning" + subtitle showing due card count (e.g., "5 cards due for review" or "All caught up for today")
  - Right: Study type toggle tabs (Flashcard / Quiz) + **Review (N)** button (disabled if 0 due)
- Separator line
- **Study by Topic** section:
  - Section label (uppercase, muted)
  - "All topics →" link
  - Row of pill-shaped topic buttons (each showing topic name + book icon)
  - Clicking a pill starts a study session for that topic
  - Loading skeleton: 4 pills of different widths
  - Empty state: "No topics yet. Create one to study by topic."
- Separator line
- **Your Vocabulary** section:
  - Section label
  - Paginated list of all enrolled words (word + definition + progress state)

### User Flow
1. User clicks **My Learning** in sidebar
2. Sees how many cards are due
3. Selects study type (Flashcard or Quiz)
4. Clicks **Review (N)** → starts a due-cards session
5. Or clicks a topic pill → starts a topic-specific session
6. Scrolls down to browse full vocabulary list

---

## Feature 7: Study Session (Flashcard Mode)

### What it does
The core learning experience. Shows vocabulary cards one at a time. The user flips each card to see the answer, then rates how well they knew it. The app schedules the next review automatically using the FSRS spaced repetition algorithm.

### UI Requirements
- Fullscreen-style layout — centered, no distractions
- Max width `3xl`, vertically centered
- **Header row:**
  - Left: **Exit** button (ghost, chevron-left)
  - Center: Progress indicator (e.g., "3 / 12")
  - Right: Keyboard hint ("Space to flip", small + muted)
- **Flashcard** (center):
  - Large rounded card (`rounded-2xl`), min-height 260px
  - **Front side:** word in large bold text (`4xl, extrabold`) + small hint label above it
  - **Back side:** definition in bold (`2xl`) + example sentence in italic muted text below
  - 3D flip animation when clicked or Space pressed
  - Feedback overlay after rating: shows next review date + interval in days (dark blur overlay, 800ms)
- **Action area** (below card):
  - When card is face-down: single **Show Answer** button (outline, centered)
  - When card is flipped: 4 rating buttons in a row:
    - **Again** (red/destructive)
    - **Hard** (secondary/gray)
    - **Good** (primary/blue)
    - **Easy** (outline)
    - Each button shows rating name + keyboard shortcut badge (`1` `2` `3` `4`)

### User Flow
1. User starts a session → spinner while cards load
2. First card appears face-down with the word
3. User reads the word, recalls the definition
4. Clicks card or presses Space → card flips to show definition + example
5. User rates their recall: Again / Hard / Good / Easy
6. Feedback overlay briefly shows next review date
7. Next card appears automatically
8. After all cards → Session Complete screen

---

## Feature 8: Study Session (Quiz Mode)

### What it does
An alternative study mode where the user answers multiple-choice questions instead of self-rating with flashcards.

### UI Requirements
- Same fullscreen layout as Flashcard mode
- Card shows a question (word or definition)
- Below the card: 4 answer option buttons
- Selected answer highlights (correct = green, wrong = red)
- Progress bar at top

### User Flow
1. User selects **Quiz** tab on My Learning page
2. Clicks **Review** → Quiz session starts
3. Each card shows a word + 4 multiple choice answers
4. User taps the correct definition
5. Visual feedback (color) + auto-advance to next card
6. After all cards → Session Complete screen

---

## Feature 9: Session Complete (Summary Screen)

### What it does
Shown after a study session ends. Celebrates the user's effort and shows session stats.

### UI Requirements
- Centered layout, max width `md`
- Large green circle icon with a checkmark (celebration visual)
- Heading: "Session complete!" (large, extrabold)
- Subtitle: "Great work — keep it up."
- **Stats row** (3 equal cells in a grid):
  - Reviewed: number of cards
  - Accuracy: percentage correct-like ratings
  - Time: elapsed time in `mm:ss`
- **Rating breakdown row** (4 cells, color-coded):
  - Again (red), Hard (orange), Good (green), Easy (blue) — each shows count
- **Back to My Learning** button (full width, with book icon)

### User Flow
1. User rates the last card → session auto-completes
2. Summary screen appears with celebration icon
3. User sees stats at a glance
4. Clicks **Back to My Learning** → returns to `/learning`

---

## Feature 10: Topics

### What it does
Topics are named collections of vocabulary (e.g., "Business Negotiations", "Travel & Airport"). Users create topics to organize their study and can study a specific topic in a focused session.

### UI Requirements

**Topics List Page:**
- App shell layout, max width `3xl`
- Header: Title "Topics" + word count subtitle + **New Topic** button (top-right)
- Separator
- Column headers row: Name · Updated · (actions spacer)
- **Topic rows** (each row):
  - Topic name (left, bold)
  - Last updated timestamp (muted, right)
  - Ghost icon buttons: Edit (pencil) + Delete (trash) — visible on row hover
  - Chevron right icon (far right)
- Loading skeleton: 6 rows of varying widths
- Empty state: folder icon + "No topics yet" + "Create your first topic" button
- Pagination: Previous/Next buttons + "Page X of Y" at bottom

**Create Topic Dialog (modal):**
- Title: "New Topic"
- Name input (required)
- Description textarea (optional)
- Submit button: "Create Topic"

**Update Topic Dialog (modal):**
- Same as Create, pre-filled with existing data
- Submit button: "Save Changes"

### User Flow (Topics List)
1. User clicks **Topics** in sidebar
2. Sees list of all topics with last-updated times
3. Clicks **New Topic** → dialog opens
4. Fills in name (and optional description) → clicks Create
5. New topic appears in list
6. Clicks a topic row → navigates to Topic Detail

### User Flow (Delete Topic)
1. User hovers over a topic row
2. Clicks trash icon → confirmation dialog appears
3. Dialog warns: "This will permanently delete [Topic Name] and remove all word associations."
4. Clicks **Delete topic** → topic removed from list

---

## Feature 11: Topic Detail

### What it does
Shows all the words inside a specific topic. Users can rename the topic, add more words from the dictionary, or remove words.

### UI Requirements
- App shell layout, max width `3xl`
- **Breadcrumb:** "← Topics / [Topic Name]"
- **Topic header:**
  - Left: Topic name (h1) + optional description + word count ("12 words")
  - Right: Edit icon button (pencil) + Delete icon button (trash)
- Separator
- **Words section:**
  - Section label "WORDS" (uppercase)
  - **Add words** button (outline, top-right of section) → links to Dictionary
  - Word rows: word + definition excerpt + remove button (on hover)
  - Loading skeleton rows
  - Empty state: inbox icon + "No words yet" + "Browse Dictionary" button
  - Pagination if >20 words

### User Flow
1. User lands on Topic Detail from Topics list
2. Sees all words in this topic
3. Clicks **Add words** → goes to Dictionary search
4. Searches and adds words → returns to topic (words now listed)
5. Hovers a word row → clicks remove icon → word removed from topic
6. Clicks pencil icon → Edit dialog opens → saves updated name/description
7. Clicks trash icon → confirms → topic deleted → redirected back to Topics list

---

## Feature 12: Dictionary Search

### What it does
A searchable database of English vocabulary. Users can look up any word to see its definitions, examples, and part of speech, then add it to their learning list or a specific topic.

### UI Requirements
- App shell layout, max content width `6xl`
- **Page hero (centered):**
  - Heading: "Dictionary" (5xl, extrabold)
  - Subtitle: description of the database
- **Search bar:**
  - Large centered input with search icon
  - Debounced — results update as user types
  - Placeholder: "Search English vocabulary…"
- **Results grid:**
  - Word sense cards in a grid
  - Each card: word (bold) + part of speech badge + short definition + "Add to Learning" button
  - Loading state: skeleton cards
  - Empty state when no results match
  - Pagination: Previous/Next with skip count

### User Flow
1. User clicks **Add Word** in sidebar (or navigates to `/dictionary`)
2. Types a word in the search bar
3. Cards appear showing matching word senses
4. User reads a definition → clicks **Add to Learning** → word added to vocabulary
5. Or clicks a card → goes to Word Sense Detail for full details

---

## Feature 13: Word Sense Detail

### What it does
The full detail page for a single word sense. Shows all available information about a word and lets users add it to their learning list or to a specific topic.

### UI Requirements
- App shell layout
- **Word header:**
  - Large word title
  - Part of speech badge
- **Definitions section:**
  - List of all definitions for this word
  - Example sentences per definition (italic, muted)
- **Actions:**
  - **Add to Learning** button (if not already added)
  - **Add to Topic** dropdown (select from user's topics)
- Back link to dictionary

### User Flow
1. User clicks a word card in Dictionary results
2. Sees full word information
3. Clicks **Add to Learning** → word enrolled in vocabulary
4. Or clicks **Add to Topic** → selects a topic from a dropdown → word added to that topic

---

## Feature 14: Flashcards

### What it does
A separate card system where users can create their own custom flashcards with any front/back content, independent of the dictionary. Also displays flashcards created from dictionary lookups.

### UI Requirements
- App shell layout, max width `3xl`
- **Header:**
  - Title "Flashcards" + count subtitle ("24 cards — 10 custom, 14 from dictionary")
  - **New Card** button (top-right, primary)
- Separator
- **Search bar:** filter cards by front or back text
- **Column headers:** Front · Back · Source · (delete)
- **Card rows:**
  - Front: word/question (bold) + optional hint below (amber text)
  - Back: answer/definition (muted)
  - Source badge: "Custom" (outline) or "Dictionary" (secondary)
  - Delete icon button (appears on row hover)
- Empty state: layers icon + "No flashcards yet" + Create First Card button
- Animated: cards fade in/out when added or deleted

**Create Flashcard Dialog (modal):**
- Title: "Create Flashcard"
- Front textarea: "Enter the question or term…"
- Back textarea: "Enter the answer or definition…"
- Hint input (optional)
- Source selector: Custom / Dictionary
- Submit button: "Create Card" (disabled until front + back filled)

### User Flow
1. User clicks **Flashcards** in sidebar
2. Sees all cards in a list
3. Optionally uses search to filter
4. Clicks **New Card** → dialog opens
5. Fills front + back (+ optional hint) → clicks Create
6. New card appears in list with animation
7. To delete: hovers a row → clicks trash icon → card removed with animation

---

## Feature 15: Flashcard Stats

### What it does
A statistics dashboard for the user's flashcard learning progress. Shows streak, cards reviewed, study time, mastered cards, and an overall mastery progress bar.

### UI Requirements
- App shell layout, max width `4xl`
- **Page header:** "Study Statistics" + subtitle "Track your learning progress"
- **Hero stats grid** (4 cards, staggered entrance animation):
  - Streak: fire icon (orange) + days count
  - Cards Reviewed: book icon (blue) + total number
  - Study Time: clock icon (purple) + minutes
  - Mastered Cards: trophy icon (yellow) + count
  - Each card: colored icon badge + large value + unit + description
- **Mastery Progress card:**
  - Progress bar (large) showing mastered / total %
  - 3-cell breakdown: Total Cards (blue) · Mastered (green) · Day Streak (orange)
- **Activity Summary row** (2 cards):
  - Last Study Session: calendar icon + date
  - This Week: zap icon + cards reviewed this week

### User Flow
1. User clicks **Flashcards** → sees stats link, or navigates to `/flashcards/stats`
2. Page loads with animated stat cards
3. User reviews their overall mastery percentage
4. Sees when they last studied and weekly activity

---

## Feature 16: Workspace Switcher

### What it does
Allows users who belong to multiple workspaces to switch between them without logging out.

### UI Requirements
- Located in the top of the sidebar (header area)
- Shows current workspace name + dropdown chevron
- Clicking opens a popover/dropdown listing all workspaces
- Each workspace item: name + type badge
- **Create New Workspace** option at bottom of list

### User Flow
1. User clicks workspace name in sidebar header
2. Dropdown shows all workspaces they belong to
3. Clicks a different workspace → app switches context, all data reloads for new workspace
4. Or clicks **Create New Workspace** → goes to Workspace Wizard

---

## Feature 17: Progress (Planned)

### What it does
A dedicated dashboard for long-term learning progress: vocabulary growth over time, study frequency, mastery rates, and learning streaks.

### UI Requirements
- App shell layout
- Weekly/monthly streak calendar heatmap
- Words learned over time line chart
- Mastery distribution (pie or bar chart)
- Study time per day bar chart
- Personal records (longest streak, most words in a day)

### User Flow
1. User clicks **Progress** in sidebar
2. Sees visual charts of their learning over time
3. Can filter by date range (this week / this month / all time)

---

## Feature 18: Achievements (Planned)

### What it does
A gamification layer that rewards users for milestones: first word learned, 7-day streak, 100 words mastered, etc.

### UI Requirements
- App shell layout
- Grid of achievement cards
- Each card: icon + achievement name + description + locked/unlocked state
- Unlocked achievements have a colored border and full opacity
- Locked achievements are grayed out with a lock icon
- Progress bar under in-progress achievements

### User Flow
1. User clicks **Achievements** in sidebar
2. Sees grid of all possible achievements
3. Unlocked ones are highlighted — locked ones show what's needed
4. Completing a milestone triggers a toast notification: "Achievement unlocked: First 100 Words!"

---

## Feature 19: Settings (Planned)

### What it does
Allows users to configure their account, workspace, and study preferences.

### UI Requirements
- App shell layout with settings sub-navigation
- **Sections:**
  - **Profile:** display name, email, avatar upload, change password
  - **Workspace:** workspace name, type, description, language settings, delete workspace
  - **Study Preferences:** daily goal, session length, notification settings
  - **Appearance:** dark/light/system mode, language (UI language)

### User Flow
1. User clicks **Settings** in sidebar
2. Navigates to a section via sub-nav
3. Updates a field → clicks **Save Changes**
4. Toast confirmation on success

---

## UI Pattern Summary (For Stitch)

| Pattern | Where used |
|---|---|
| Centered auth card | Login, Register |
| Multi-step wizard with progress bar | Workspace Onboarding |
| App shell with collapsible sidebar | All authenticated pages |
| Fullscreen focused mode | Study Session |
| List with hover-reveal actions | Topics, Flashcards, Words |
| Stats grid with colored icon badges | Dashboard, Stats page |
| Circular progress ring | Dashboard daily goal |
| Flip animation card | Flashcard study |
| 4-button rating row | Study session after flip |
| Celebration summary screen | Session complete |
| Empty state with icon + CTA | All list pages |
| Dialog/modal for create/edit | Topics, Flashcards |
| Alert dialog for destructive actions | Delete topic, delete card |
| Skeleton loading rows | All list pages |
| Breadcrumb navigation | Topic detail |
| Pill/chip tags | Topic quick-study buttons |
| Progress bar in rows | Recent topics, mastery |
| Badge labels | Flashcard source, workspace type |
