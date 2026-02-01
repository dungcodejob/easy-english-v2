# 📖 Hướng dẫn Setup Router - TanStack Router

## Tổng quan

Project này sử dụng **TanStack Router** với cách tiếp cận **Virtual File Routes**, cho phép định nghĩa routes tập trung trong một file thay vì dựa vào cấu trúc thư mục.

## 📁 Cấu trúc files liên quan

```
client/
├── rsbuild.config.ts          # Config Rsbuild với TanStack Router plugin
├── src/
│   ├── index.tsx              # Entry point - khởi tạo router
│   ├── root.tsx               # Root route component
│   ├── routes.ts              # ⭐ Định nghĩa tất cả routes
│   ├── routeTree.gen.ts       # Auto-generated (không sửa trực tiếp)
│   └── shared/constants/routes.ts  # Hằng số đường dẫn
```

---

## 1️⃣ Cấu hình Rsbuild Plugin

**File:** `rsbuild.config.ts`

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: 'react',
          virtualRouteConfig: './src/routes.ts',  // File định nghĩa routes
          routesDirectory: './src',               // Thư mục chứa page components
          autoCodeSplitting: true,                // Tự động code-splitting
        }),
      ],
    },
  },
});
```

---

## 2️⃣ Entry Point

**File:** `src/index.tsx`

```typescript
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen.ts';  // Auto-generated file
import './styles/globals.css';

// Tạo router từ routeTree
const router = createRouter({ routeTree });

// Đăng ký type cho router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
```

---

## 3️⃣ Định nghĩa Routes (Virtual File Routes)

**File:** `src/routes.ts`

```typescript
import { index, layout, rootRoute, route } from '@tanstack/virtual-file-routes';
import { APP_ROUTES } from './shared/constants';

export const routes = rootRoute('root.tsx', [
  // Public index page
  index('index.tsx'),

  // ========== LAYOUT AUTHENTICATED ==========
  layout('(authenticated)', './modules/shell/pages/authenticated-layout.tsx', [
    // Index page trong layout
    index('./modules/home/pages/home-page.tsx'),

    // Route thông thường
    route('/dictionary/$keyword', './modules/word-detail/pages/$keyword.tsx'),

    // Nested layout (layout lồng nhau)
    layout('/topic', './modules/topic/pages/topic-layout.tsx', [
      index('./modules/topic/pages/topic-page.tsx'),
      route('$topicId', './modules/topic/pages/topic-detail-page.tsx'),
    ]),

    // Routes sử dụng hằng số
    route(APP_ROUTES.LEARN, './modules/home/pages/learn-page.tsx'),
    route(APP_ROUTES.REVIEW, './modules/home/pages/review-page.tsx'),
    route(APP_ROUTES.SETTINGS, './modules/home/pages/settings-page.tsx'),
  ]),

  // ========== LAYOUT UNAUTHENTICATED ==========
  layout('(unauthenticated)', './modules/shell/pages/unauthenticated-layout.tsx', [
    route(APP_ROUTES.AUTH.LOGIN, './modules/auth/pages/login-page.tsx'),
    route(APP_ROUTES.AUTH.REGISTER, './modules/auth/pages/register-page.tsx'),
  ]),

  // ========== LAYOUT ONBOARDING ==========
  layout('(onboarding)', './modules/workspace/pages/onboarding-layout.tsx', [
    route(APP_ROUTES.ONBOARDING.WORKSPACE, './modules/workspace/pages/create-workspace-page.tsx'),
  ]),
]);
```

### API Functions:

| Function | Mô tả |
|----------|-------|
| `rootRoute(file, children)` | Định nghĩa root route |
| `layout(id, file, children)` | Tạo layout wrapper cho các routes con |
| `route(path, file)` | Định nghĩa một route đơn |
| `index(file)` | Định nghĩa index route (path = `/`) |

---

## 4️⃣ Viết Page Components

### Layout Component (có Outlet)

**File:** `authenticated-layout.tsx`

```typescript
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { useAuthStore } from '@auth/stores';

// Tạo route với path ID khớp với định nghĩa trong routes.ts
export const Route = createFileRoute('/_(authenticated)')({
  component: AuthenticatedLayout,
  
  // Guard: chạy trước khi load route
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname },
        replace: true,
      });
    }
    return true;
  },
});

export function AuthenticatedLayout() {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>
        <Outlet />  {/* ← Render child routes ở đây */}
      </main>
    </div>
  );
}
```

### Nested Layout Component

**File:** `topic-layout.tsx`

```typescript
import { Outlet, createFileRoute } from '@tanstack/react-router';

// Path ID = /_(parentLayout)/_/childLayout
export const Route = createFileRoute('/_(authenticated)/_/topic')({
  component: TopicLayout,
});

export function TopicLayout() {
  return <Outlet />;  // Hoặc thêm layout riêng
}
```

### Page Component (không có Outlet)

**File:** `home-page.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';

// Index route của authenticated layout
export const Route = createFileRoute('/_(authenticated)/')({
  component: HomePage,
});

export function HomePage() {
  return <div>Home Page</div>;
}
```

### Dynamic Route (với params)

**File:** `$keyword.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_(authenticated)/dictionary/$keyword')({
  component: WordDetailPage,
});

function WordDetailPage() {
  // Lấy params từ URL
  const { keyword } = Route.useParams();

  return <div>Keyword: {keyword}</div>;
}
```

### Nested Dynamic Route

**File:** `topic-detail-page.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_(authenticated)/_/topic/$topicId')({
  component: TopicDetailPage,
});

export function TopicDetailPage() {
  const { topicId } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <div>
      <h1>Topic: {topicId}</h1>
      <button onClick={() => navigate({ to: '/topic' })}>
        Back to Topics
      </button>
    </div>
  );
}
```

---

## 5️⃣ Route Path ID Convention

| Loại | Pattern trong `routes.ts` | Path ID trong component |
|------|---------------------------|-------------------------|
| Root layout | `rootRoute('root.tsx', [...])` | `__root__` |
| Pathless layout | `layout('(name)', file, [...])` | `/_(name)` |
| Layout với path | `layout('/path', file, [...])` | `/_(parent)/_/path` |
| Index route | `index(file)` | `/_(parent)/` |
| Route thông thường | `route('/path', file)` | `/_(parent)/path` |
| Dynamic route | `route('$param', file)` | `/_(parent)/$param` |

---

## 6️⃣ Hằng số Routes

**File:** `src/shared/constants/routes.ts`

```typescript
export const APP_ROUTES = {
  ROOT: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  ONBOARDING: {
    WORKSPACE: '/onboarding/workspace',
  },
  TOPIC: {
    LIST: '/topic',
    DETAIL: '/topic/$topicId',
  },
  LEARN: 'learn',        // Relative path (không có /)
  REVIEW: 'review',
  SETTINGS: 'settings',
} as const;
```

> ⚠️ **Lưu ý:** Routes không có `/` ở đầu sẽ là relative path

---

## 7️⃣ Thêm Route Mới

### Bước 1: Định nghĩa trong `routes.ts`

```typescript
// Trong authenticated layout
layout('(authenticated)', './modules/shell/pages/authenticated-layout.tsx', [
  // ... existing routes
  
  // Thêm route mới
  route('/profile', './modules/profile/pages/profile-page.tsx'),
]),
```

### Bước 2: Tạo Page Component

```typescript
// src/modules/profile/pages/profile-page.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_(authenticated)/profile')({
  component: ProfilePage,
});

export function ProfilePage() {
  return <div>Profile</div>;
}
```

### Bước 3: Chạy dev server

```bash
npm run dev
```

File `routeTree.gen.ts` sẽ được tự động generate lại.

---

## 8️⃣ Navigation

### Sử dụng Link component

```typescript
import { Link } from '@tanstack/react-router';

<Link to="/topic/$topicId" params={{ topicId: '123' }}>
  Go to Topic
</Link>
```

### Sử dụng useNavigate hook

```typescript
import { useNavigate } from '@tanstack/react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/topic/$topicId', params: { topicId: '123' } });
  };
}
```

### Sử dụng Route.useNavigate (type-safe)

```typescript
export function TopicDetailPage() {
  const navigate = Route.useNavigate();

  return (
    <button onClick={() => navigate({ to: '/topic' })}>
      Back to Topics
    </button>
  );
}
```

---

## 📌 Tóm tắt

| Thành phần | File | Vai trò |
|------------|------|---------|
| Plugin config | `rsbuild.config.ts` | Cấu hình TanStack Router plugin |
| Router entry | `src/index.tsx` | Khởi tạo và mount router |
| Route definitions | `src/routes.ts` | Định nghĩa cấu trúc routes |
| Route tree | `src/routeTree.gen.ts` | Auto-generated, không sửa |
| Route constants | `shared/constants/routes.ts` | Hằng số paths |
| Root component | `src/root.tsx` | Root layout với Providers |

---

## 🔗 Tài liệu tham khảo

- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [Virtual File Routes](https://tanstack.com/router/latest/docs/framework/react/guide/virtual-file-routes)
- [Route Guards (beforeLoad)](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)
