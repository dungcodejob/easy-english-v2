# Research Template

> Template for feature research and discovery. Copy to `docs/superpowers/research/YYYY-MM-DD-<feature-name>-research.md`.

---

## Metadata

| Field | Value |
|-------|-------|
| **Feature** | `<Feature Name>` |
| **Researcher** | `<Name>` |
| **Date** | `YYYY-MM-DD` |

---

## 1. Research Question

_What specific question or problem are we trying to solve?_

Example: *How should we implement card scheduling to minimize user forgetting while respecting daily limits?*

---

## 2. Background

_Context and existing knowledge:_

- What we already know about this problem
- Related features already implemented
- Any existing patterns in the codebase

---

## 3. Options Considered

### Option A: _Name_

**Description:**
_What this option involves._

**Pros:**
- ✓ Benefit 1
- ✓ Benefit 2

**Cons:**
- ✗ Drawback 1
- ✗ Drawback 2

**Effort:** Low / Medium / High
**Risk:** Low / Medium / High

### Option B: _Name_

**Description:**
_..._

---

## 4. Evaluation Criteria

How we will evaluate options:

| Criterion | Weight | Measurement |
|-----------|--------|-------------|
| User experience | 30% | Survey / A/B test |
| Implementation effort | 20% | Story points |
| Maintenance | 20% | Code complexity score |
| Performance | 15% | Benchmark results |
| Compatibility | 15% | Integration test pass rate |

---

## 5. Analysis

### 5.1 Benchmark Results

_If applicable, paste benchmark output or performance measurements._

```
$ benchmark command
results...
```

### 5.2 Code Examples

_Annotated code snippets from exploration:_

```typescript
// This pattern works well because...
const example = 'code';
```

### 5.3 Trade-off Analysis

| Option | Score | Rationale |
|--------|-------|-----------|
| Option A | X/Y | Because... |
| Option B | X/Y | Because... |

---

## 6. Recommendation

**Recommended option: Option A / B / None**

**Rationale:**
_2-3 sentences explaining why._

---

## 7. Open Questions

_Questions that couldn't be answered during research:_

1. _Question — Who should answer this?_
2. _Question — What experiment would answer this?_

---

## 8. Next Steps

Based on this research, the recommended next step is to:

1. _Action_
2. _Action_

---

## 9. References

- [Link 1](url) — _Description_
- [Link 2](url) — _Description_
