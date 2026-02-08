# Quickstart: Workspace Onboarding Wizard

**Feature**: 003-workspace-onboarding

---

## Prerequisites

1. Server running at `http://localhost:3000`
2. Client running at `http://localhost:4200`
3. Database migrations applied

---

## Quick Setup

### 1. Start Backend

```bash
cd server
npm run start:dev
```

### 2. Start Frontend

```bash
cd client
npm run dev
```

### 3. Create Test User

Register a new user via the register page or API:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

---

## Testing the Feature

### Manual Flow

1. Login with the test user
2. User should be redirected to `/workspace/new` (no workspace exists)
3. Complete the 4-step wizard:
   - **Step 1**: Enter workspace name (e.g., "My English Learning")
   - **Step 2**: Select language (e.g., "EN")
   - **Step 3**: Configure preferences (or skip)
   - **Step 4**: Review and create
4. Upon success, user is redirected to dashboard

### API Testing

**Create Workspace:**

```bash
curl -X POST http://localhost:3000/api/v1/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "name": "My English Learning",
    "language": "EN",
    "workspaceType": "PERSONAL",
    "learningGoal": "VOCABULARY",
    "level": "BEGINNER",
    "dailyTarget": 10,
    "studyReminder": false,
    "defaultLearningMode": "FLASHCARD"
  }'
```

**List Workspaces:**

```bash
curl http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer <access_token>"
```

**Check Has Workspace:**

```bash
curl http://localhost:3000/api/v1/workspaces/check \
  -H "Authorization: Bearer <access_token>"
```

---

## Key Files

### Backend

| File | Purpose |
|------|---------|
| `server/src/modules/workspace/workspace.module.ts` | Module definition |
| `server/src/modules/workspace/controllers/workspace.controller.ts` | HTTP endpoints |
| `server/src/modules/workspace/domain/entities/workspace.entity.ts` | Domain entity |
| `server/src/modules/workspace/application/commands/create-workspace.handler.ts` | Create command |
| `server/src/modules/workspace/application/queries/list-workspaces.handler.ts` | List query |
| `server/src/modules/workspace/application/queries/check-has-workspace.handler.ts` | Check query |

### Frontend

| File | Purpose |
|------|---------|
| `client/src/modules/workspace/pages/workspace-wizard-page.tsx` | Wizard page |
| `client/src/modules/workspace/components/wizard-*.tsx` | Wizard step components |
| `client/src/modules/workspace/hooks/use-create-workspace.ts` | Create mutation |
| `client/src/modules/workspace/hooks/use-has-workspace.ts` | Check workspace query |
| `client/src/modules/workspace/stores/use-wizard-store.ts` | Wizard UI state |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Redirect loop | Clear auth tokens, re-login |
| Workspace not created | Check server logs for validation errors |
| 409 Conflict | Workspace name already exists for this user |
