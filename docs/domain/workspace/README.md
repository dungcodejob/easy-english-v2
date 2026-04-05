# Workspace Module — Domain Reference

> Handles multi-tenant workspace management, settings, and learning preferences.

---

## 1. Overview

The workspace module is the core of the multi-tenancy model. Each workspace represents an isolated learning environment with its own users, flashcards, progress, and settings. Every data operation is scoped to the active `workspaceId` from the JWT.

---

## 2. Entity: `WorkspaceEntity` (Aggregate Root)

Represents a tenant workspace — the primary isolation boundary.

```typescript
// File: server/src/modules/workspace/domain/entities/workspace.entity.ts
import { AggregateRoot } from '@core/ddd';

export interface WorkspaceProps {
  tenantId: string;              // Unique tenant identifier (UUID)
  userId: string;               // Owner user ID (FK → User._id)
  name: string;
  description?: string;
  type: WorkspaceType;
  language: Language;            // Native language
  learningGoal: LearningGoal;
  level: Level;
  dailyTarget: number;          // Daily card target
  studyReminder: boolean;
  defaultLearningMode: LearningMode;
}

export class WorkspaceEntity extends AggregateRoot {
  public tenantId: string;
  public userId: string;
  public name: string;
  public description?: string;
  public type: WorkspaceType;
  public language: Language;
  public learningGoal: LearningGoal;
  public level: Level;
  public dailyTarget: number;
  public studyReminder: boolean;
  public defaultLearningMode: LearningMode;
  // _id (uuid) inherited from Entity base
  // createdAt, updatedAt inherited from Entity base
}
```

**Domain Methods:**
```typescript
static create(props: WorkspaceProps): WorkspaceEntity
static rehydrate(props: CreateEntityProps<WorkspaceProps>): WorkspaceEntity
validate(): void
```

**Events Emitted:**
- `WorkspaceCreatedEvent` — fired on creation with `workspaceId`, `userId`, `tenantId`

---

## 3. Enums

```typescript
// File: server/src/modules/workspace/domain/enums/workspace-enums.ts

export enum WorkspaceType {
  Personal = 'Personal',
  Team = 'Team',
  Classroom = 'Classroom',
}

export enum Language {
  EN = 'EN', VI = 'VI', ES = 'ES', FR = 'FR',
  DE = 'DE', JA = 'JA', KO = 'KO', ZH = 'ZH',
}

export enum LearningGoal {
  Vocabulary = 'Vocabulary',
  ExamPrep = 'ExamPrep',
  DailyPractice = 'DailyPractice',
}

export enum Level {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum LearningMode {
  Flashcard = 'Flashcard',
  Quiz = 'Quiz',
  SpacedRepetition = 'SpacedRepetition',
}
```

---

## 4. Domain Events

| Event | Trigger | Key Payload |
|-------|---------|-------------|
| `WorkspaceCreatedEvent` | `WorkspaceEntity.create()` | `workspaceId`, `userId`, `tenantId` |

---

## 5. Commands

| Command | Handler | Purpose |
|---------|---------|---------|
| `CreateWorkspaceCommand` | `CreateWorkspaceCommandHandler` | Create a new workspace |

```typescript
// File: server/src/modules/workspace/application/commands/create-workspace.command.ts
export class CreateWorkspaceCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly type: WorkspaceType,
    public readonly language: Language,
    public readonly learningGoal: LearningGoal,
    public readonly level: Level,
    public readonly dailyTarget: number,
    public readonly studyReminder: boolean,
    public readonly defaultLearningMode: LearningMode,
    public readonly description?: string,
  ) {}
}
```

---

## 6. Queries

| Query | Handler | Purpose |
|-------|---------|---------|
| `ListWorkspacesQuery` | `ListWorkspacesQueryHandler` | Get all workspaces for a user |
| `GetWorkspaceQuery` | `GetWorkspaceQueryHandler` | Get single workspace by ID |
| `CheckHasWorkspaceQuery` | `CheckHasWorkspaceQueryHandler` | Check if user has any workspace |

---

## 7. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/workspaces` | JWT | Create workspace |
| `GET` | `/api/v1/workspaces` | JWT | List user's workspaces |
| `GET` | `/api/v1/workspaces/check` | JWT | Check if user has workspace |
| `GET` | `/api/v1/workspaces/:id` | JWT | Get single workspace |

---

## 8. Data Model

```
┌──────────────────────────────┐       ┌──────────────────────────────┐
│           User                 │       │          Workspace             │
│  _id: uuid (PK)             │       │  _id: uuid (PK)               │
│  tenantId: uuid              │       │  tenantId: uuid (UNIQUE)      │
│  email: Email               │       │  userId: uuid (FK)            │
│  username: Username          │       │  name: text                   │
│  name: text                  │  1:N  │  description: text?            │
│  role: UserRole              │ ─────►│  type: WorkspaceType         │
└──────────────────────────────┘       │  language: Language           │
                                       │  learningGoal: LearningGoal   │
                                       │  level: Level                │
                                       │  dailyTarget: int            │
                                       │  studyReminder: boolean      │
                                       │  defaultLearningMode: LM      │
                                       └──────────────────────────────┘

UserWorkspace: join table — User ↔ Workspace (many-to-many)
  userId (FK), workspaceId (FK), role: 'owner'|'admin'|'member'
```

---

## 9. Related Documentation

- [Architecture Overview](../../architecture/architecture-overview.md) — System map
- [Multi-Tenant Design](../../architecture/multi-tenant-design.md) — Tenant isolation
