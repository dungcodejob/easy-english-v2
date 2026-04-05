# Implementation Plan Template

> Template for implementation plans. Copy to `docs/superpowers/plans/YYYY-MM-DD-<feature-name>-implementation.md`.

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature** | `<Feature Name>` |
| **Spec** | `<Link to spec.md>` |
| **Author** | `<Author Name>` |
| **Created** | `YYYY-MM-DD` |

---

## 1. Overview

_One paragraph summarizing what will be built and how it maps to the spec._

---

## 2. Implementation Phases

### Phase 1: Foundation

_Prerequisites and core infrastructure._

#### Tasks

- [ ] **Task 1.1** — _Description_
- [ ] **Task 1.2** — _Description_

#### Files to Change

```
server/src/modules/<module>/
  └── new-file.ts
```

---

### Phase 2: Core Feature

_The main feature implementation._

#### Tasks

- [ ] **Task 2.1** — _Description_
- [ ] **Task 2.2** — _Description_

#### Files to Change

```
server/src/modules/<module>/
  └── updated-file.ts
client/src/modules/<module>/
  └── new-component.tsx
```

---

### Phase 3: Integration & Polish

_UI, API integration, error handling._

#### Tasks

- [ ] **Task 3.1** — _Description_

#### Files to Change

```
client/src/modules/<module>/
  └── page.tsx
```

---

## 3. Database Migrations

_If schema changes are needed:_

```bash
npm run migration:create -- --name <migration-name>
```

_Migration description: what does it add/change/remove?_

---

## 4. Test Plan

| Phase | Tests to Add/Update |
|-------|-------------------|
| Phase 1 | Unit tests for domain logic |
| Phase 2 | Integration tests for repository |
| Phase 3 | E2E test for user flow |

---

## 5. Rollout Checklist

- [ ] Feature flag configured
- [ ] Database migration applied
- [ ] Client deployed
- [ ] Server deployed
- [ ] Monitoring dashboards updated
- [ ] Rollback plan documented

---

## 6. Rollback Plan

_How to revert if issues are found in production:_

1. Disable feature flag
2. Revert server deployment
3. Run `npm run migration:down` (if needed)
4. Notify affected users

---

## 7. Monitoring

| Metric | Alert Threshold |
|--------|--------------|
| Error rate | > 1% |
| Latency p99 | > 500ms |
| 5xx responses | > 0 |

---

## 8. Open Questions Resolved

_Answers to open questions from the spec:_

1. **Q1**: _Answer_
2. **Q2**: _Answer_
