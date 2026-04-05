# Git Workflow

> Branch strategy, pull request process, and collaboration conventions.

---

## 1. Branch Strategy

### Branch Types

```
main                  ← Production-ready code (protected)
  └── develop         ← Integration branch (protected)
        ├── feature/<ticket>-<short-description>
        ├── fix/<ticket>-<short-description>
        ├── refactor/<ticket>-<short-description>
        ├── docs/<ticket>-<short-description>
        └── chore/<ticket>-<short-description>
```

### Branch Naming

```
feature/ee2-123-add-flashcard-study-session
fix/ee2-456-login-redirect-loop
refactor/ee2-789-move-flashcard-to-learning-module
docs/ee2-101-api-documentation
chore/ee2-102-upgrade-tanstack-query
```

Format: `<type>/<ticket-id>-<kebab-case-description>`

---

## 2. Workflow

### 2.1 Feature Development

```bash
# 1. Start from latest main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/ee2-123-my-feature

# 3. Make commits (see commit guidelines)
git add .
git commit -m "feat(module): add my new feature"

# 4. Keep main up-to-date (rebase, not merge)
git fetch origin main
git rebase origin/main

# 5. Push branch
git push -u origin feature/ee2-123-my-feature

# 6. Open Pull Request
gh pr create --fill
```

### 2.2 Review & Merge

1. **Open PR** against `main` (or `develop` if using that workflow)
2. **Fill PR description** using the template:
   - Summary of changes
   - Test plan
   - Screenshots (if UI changes)
3. **Request review** from at least one team member
4. **Address feedback** — make changes, force-push to your branch
5. **Squash merge** — PR is squashed into a single commit on `main`

---

## 3. Pull Request Checklist

Before requesting review:

- [ ] Code follows [coding standards](./coding-standards.md)
- [ ] Tests added or updated for new behavior
- [ ] No console.log statements left in code
- [ ] API endpoints documented (if new/modified)
- [ ] Environment variables documented (if new)
- [ ] `gitnexus_detect_changes()` shows only expected files

---

## 4. Protected Branches

| Branch | Protection Rules |
|--------|----------------|
| `main` | No direct pushes. Require PR + 1 approval. Require passing CI. |
| `develop` | Same as `main` (if used) |

---

## 5. Hotfix Process

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b fix/ee2-999-urgent-login-bug

# Make minimal fix
git commit -m "fix(auth): resolve login redirect loop on mobile"

# Open PR directly to main (bypass normal flow for critical fixes)
gh pr create --base main --fill

# After merge, tag the release
git checkout main
git pull
git tag -a v1.2.1 -m "Fix: urgent login bug"
git push origin v1.2.1
```

---

## 6. GitNexus Integration

Before committing, always run:

```bash
npx gitnexus detect_changes --scope staged
```

This verifies your changes only affect expected files and execution flows.

---

## 7. Related Documentation

- [Coding Standards](./coding-standards.md) — Code conventions
- [Commit Guidelines](./commit-guidelines.md) — Commit message format
- [Folder Structure](./folder-structure.md) — Project layout
