# Routing

> TanStack Router configuration, route structure, and navigation patterns.

---

## 1. Router Setup

Routes are defined in `client/src/routes.ts` using TanStack Router's virtual file-based approach. A generated `routeTree.gen.ts` file provides type-safe route objects.

```typescript
// File: client/src/routes.ts
import { index, layout, rootRoute, route } from '@tanstack/virtual-file-routes';

// Route definitions — references actual page files
export const routes = rootRoute('root.tsx', [
  index('modules/shell/pages/landing-page.tsx'),

  // Public auth routes
  layout('(unauthenticated)', './modules/shell/pages/unauthenticated-layout.tsx', [
    route(AuthRoutes.login(), './modules/auth/pages/login-page.tsx'),
    route(AuthRoutes.register(), './modules/auth/pages/register.page.tsx'),
  ]),

  // Protected app routes
  layout('(authenticated)', './modules/shell/pages/authenticated-layout.tsx', [
    route(APP_ROUTES.DASHBOARD, './modules/dashboard/pages/dashboard-page.tsx'),
    route(APP_ROUTES.LEARN, './modules/learning/pages/my-learning.page.tsx'),
    // ... more routes
  ]),
]);
```

---

## 2. Route Constants

All routes are defined as constants — never hardcoded as strings:

```typescript
// File: client/src/shared/constants/routes.ts

export const AuthRoutes = {
  login: () => '/login',
  register: () => '/register',
};

export const WorkspaceRoutes = {
  new: () => '/workspace/new',
  list: () => '/workspace',
};

export const TopicRoutes = {
  list: () => '/learning/topics',
  detail: (topicId: string) => `/learning/topics/${topicId}`,
};

export const DictionaryRoutes = {
  search: () => '/dictionary',
  senseDetail: (senseId: string) => `/dictionary/senses/${senseId}`,
};

export const LearnRoutes = {
  base: () => '/learning',
  study: () => '/learning/study',
};

export const FlashcardsRoutes = {
  list: () => '/flashcards',
  study: () => '/study',
  stats: () => '/flashcards/stats',
};

export const AppRoutes = {
  root: () => '/',
  auth: AuthRoutes,
  workspace: WorkspaceRoutes,
  topic: TopicRoutes,
  dictionary: DictionaryRoutes,
  learn: LearnRoutes,
  flashcards: FlashcardsRoutes,
};
```

---

## 3. Route Structure Diagram

```
root.tsx
│
├── Landing Page (public)
│
├── (unauthenticated) layout
│   ├── /login
│   └── /register
│
└── (authenticated) layout
    ├── /                              → Dashboard
    ├── /learning                     → My Learning
    │   ├── /learning/topics           → Topics list
    │   │   └── /learning/topics/:id   → Topic detail
    │   └── /learning/study            → Study session
    │
    ├── /flashcards                   → Flashcards list
    │   ├── /study                     → Flashcard study
    │   └── /flashcards/stats          → Study statistics
    │
    ├── /workspace/new                → New workspace wizard
    │
    └── /dictionary                   → Dictionary search
        └── /dictionary/senses/:id    → Word sense detail
```

---

## 4. Layouts

### Unauthenticated Layout

Applied to public routes (login, register). Does not render the app shell.

```typescript
// File: client/src/modules/shell/pages/unauthenticated-layout.tsx
export const UnauthenticatedLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
};
```

### Authenticated Layout

Applied to all protected routes. Renders the full app shell (sidebar, header).

```typescript
// File: client/src/modules/shell/pages/authenticated-layout.tsx
export const AuthenticatedLayout = () => {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

---

## 5. Protected Route Guard

The `ProtectedRoute` component checks authentication before rendering:

```typescript
// File: client/src/modules/shell/components/protected-route.tsx
export const ProtectedRoute = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={AuthRoutes.login()} />;
  }

  return <Outlet />;
};
```

---

## 6. Navigation

Use route constants for navigation:

```typescript
import { useNavigate } from '@tanstack/react-router';
import { TopicRoutes } from '@/shared/constants/routes';

// Navigate to a route
const navigate = useNavigate();
await navigate({ to: TopicRoutes.detail(topic.id) });

// Navigate to a route with params
await navigate({
  to: DictionaryRoutes.senseDetail($senseId),
  params: { senseId: 'uuid' },
});
```

---

## 7. URL Parameters

Dynamic route segments use `$` prefix in route definitions and are accessed via the generated `routeTree`:

```typescript
// In route definition
route(TopicRoutes.detail('$topicId'), './modules/topic/pages/topic-detail.page.tsx')

// In page component
import { useParams } from '@tanstack/react-router';
const { topicId } = useParams({ from: TopicRoutes.detail('$topicId') });
```

---

## 8. Related Documentation

- [Overview](./overview.md) — Folder structure and module conventions
- [State Management](./state-management.md) — Zustand + TanStack Query patterns
