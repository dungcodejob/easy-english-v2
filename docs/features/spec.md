# Feature Specification Template

> Template for writing feature specifications. Copy to `docs/superpowers/specs/YYYY-MM-DD-<feature-name>-design.md`.

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature** | `<Feature Name>` |
| **Author** | `<Author Name>` |
| **Created** | `YYYY-MM-DD` |
| **Status** | Draft / In Review / Approved |
| **Epic** | `<Epic Name>` (if applicable) |

---

## 1. Summary

_One paragraph: what does this feature do, why does it exist, who benefits?_

---

## 2. Goals

### What This Feature Aims to Achieve

1. _Goal 1_
2. _Goal 2_
3. _Goal 3_

---

## 3. Non-Goals

_What this feature explicitly does NOT aim to solve:_

- ~~Non-goal 1~~
- ~~Non-goal 2~~

---

## 4. User Stories

### Story 1: _User does X_

**As a** `<role>`
**I want to** `<action>`
**So that** `<outcome>`

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

### Story 2: _User does Y_

**As a** `<role>`
**I want to** `<action>`
**So that** `<outcome>`

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

---

## 5. Functional Specification

### 5.1 Behavior Description

_How the feature behaves from the user's perspective._

```
┌──────────────────────────────────────────────────────────┐
│                    User Action Flow                        │
│                                                          │
│  Step 1: User triggers action                          │
│      │                                                  │
│      ▼                                                  │
│  Step 2: System validates input                        │
│      │                                                  │
│      ▼                                                  │
│  Step 3: System processes                             │
│      │                                                  │
│      ▼                                                  │
│  Step 4: System responds with result                  │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Data Model

_What new entities, fields, or relationships are needed._

```typescript
// New Entity / DTO / Value Object
interface FeatureData {
  id: string;
  // fields...
}
```

### 5.3 API Changes

| Method | Endpoint | Changes |
|--------|----------|---------|
| `GET` | `/api/v1/resource` | New or modified |
| `POST` | `/api/v1/resource` | New |

---

## 6. Edge Cases & Error Handling

| Case | Expected Behavior |
|------|-----------------|
| Empty state | Show empty state UI |
| Network failure | Show retry option |
| Validation failure | Show inline field errors |
| Unauthorized access | Redirect to login |

---

## 7. UI/UX Specification

### Layout

_Describe the layout and key UI elements._

### Component States

| State | Visual | Behavior |
|-------|--------|---------|
| Default | Default styling | Interactive |
| Loading | Skeleton / spinner | Disabled |
| Error | Error border + message | Non-interactive |
| Success | Success feedback | Dismissible |

### Accessibility

- [ ] Keyboard navigable
- [ ] Screen reader labels
- [ ] Focus management
- [ ] Color contrast compliant

---

## 8. Technical Design

### 8.1 Server Changes

| Layer | Changes |
|-------|---------|
| Domain | New entity? Value objects? Events? |
| Application | Commands? Queries? Handlers? |
| Infrastructure | Repository changes? ORM entities? |
| Presentation | New endpoints? DTOs? |

### 8.2 Client Changes

| Layer | Changes |
|-------|---------|
| API | New service functions? |
| Hooks | New TanStack Query hooks? |
| Components | New components? |
| Pages | New route pages? |
| Stores | New Zustand store? |

---

## 9. Testing Strategy

| Test Type | Scope |
|-----------|-------|
| Unit tests | Domain logic, FSRS calculations |
| Integration tests | Repository, API endpoints |
| E2E tests | Full user flows |
| Visual regression | Key UI states |

---

## 10. Open Questions

_Questions to resolve before implementation:_

1. _Question 1_
2. _Question 2_

---

## 11. Dependencies

| Dependency | Reason |
|-----------|-------|
| _Feature/Module_ | _Why needed_ |

---

## 12. Rollout Plan

| Phase | Scope | Trigger |
|-------|-------|---------|
| Phase 1 | _Subset of users_ | Feature flag enabled |
| Phase 2 | _All users_ | Monitoring looks healthy |
