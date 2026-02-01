# Frontend Setup Guide

Hướng dẫn thiết lập dự án Frontend với **Rsbuild**, **React 19**, **TypeScript**, và **Tailwind CSS v4**.

---

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Tạo dự án mới](#2-tạo-dự-án-mới)
3. [Cấu hình TypeScript](#3-cấu-hình-typescript)
4. [Cấu hình Rsbuild](#4-cấu-hình-rsbuild)
5. [Cài đặt UI Library (shadcn/ui)](#5-cài-đặt-ui-library-shadcnui)
6. [Cấu trúc thư mục](#6-cấu-trúc-thư-mục)
7. [Thư viện bổ sung](#7-thư-viện-bổ-sung)
8. [Scripts](#8-scripts)
9. [Chạy dự án](#9-chạy-dự-án)

---

## 1. Yêu cầu hệ thống

| Công cụ   | Phiên bản    | Ghi chú                      |
| --------- | ------------ | ---------------------------- |
| Node.js   | >= 18.x      | Khuyến nghị LTS              |
| Bun       | >= 1.x       | Thay thế npm/yarn (tùy chọn) |
| Git       | >= 2.x       | Quản lý version control      |

---

## 2. Tạo dự án mới

```bash
bun create rsbuild@latest
```

Các tùy chọn khi tạo project:

| Prompt                    | Giá trị chọn                      |
| ------------------------- | --------------------------------- |
| Project name or path      | `client`                          |
| Select framework          | `react`                           |
| Select language           | `typescript`                      |
| Select additional tools   | `eslint`, `prettier`, `tailwindcss` |

---

## 3. Cấu hình TypeScript

Cập nhật file `tsconfig.json` để thêm path aliases:

```json
{
  "compilerOptions": {

    ...
    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@shared": ["./src/shared"],
      "@core/*": ["./src/core/*"],
      "@core": ["./src/core"],
      "@modules/*": ["./src/modules/*"],
      "@modules": ["./src/modules"]
    }

        ...
    
  },
  "include": ["src"]
}
```

---

## 4. Cấu hình Rsbuild

Cập nhật file `rsbuild.config.ts`:

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    alias: {
      '@': './src',
      '@shared': './src/shared',
      '@core': './src/core',
      '@modules': './src/modules',
    },
  },
  html: {
    title: 'Easy English',
    favicon: './public/favicon.png',
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## 5. Cài đặt UI Library (shadcn/ui)

> **Tham khảo**: [shadcn/ui Manual Installation](https://ui.shadcn.com/docs/installation/manual)

shadcn/ui là một collection các re-usable components được xây dựng trên Radix UI và Tailwind CSS. Components không được cài đặt như một dependency, mà được copy trực tiếp vào project của bạn.

### 5.1. Cài đặt dependencies

Thêm các dependencies cần thiết cho shadcn/ui:

```bash
bun add class-variance-authority clsx tailwind-merge lucide-react tw-animate-css

```

| Package                   | Mục đích                                              |
| ------------------------- | ----------------------------------------------------- |
| `class-variance-authority`| Quản lý component variants (size, color, state...)    |
| `clsx`                    | Utility để merge class names có điều kiện             |
| `tailwind-merge`          | Merge Tailwind classes thông minh, tránh conflict     |
| `lucide-react`            | Icon library mặc định của shadcn/ui                   |
| `tw-animate-css`          | Animation utilities cho Tailwind CSS                  |

### 5.2. Cấu hình path aliases

Đảm bảo `tsconfig.json` đã có path aliases (đã cấu hình ở bước 3):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/shared/ui/shadcn",
    "utils": "@/shared/utils",
    "ui": "@/shared/ui/shadcn",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 5.3. Tạo utility function `cn`

Tạo file `src/shared/utils/tailwind.ts`:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Giải thích**:
- `clsx`: Cho phép viết class names có điều kiện: `clsx("base", isActive && "active")`
- `twMerge`: Giải quyết conflict giữa các Tailwind classes: `twMerge("px-2 px-4")` → `"px-4"`

### 5.4. Cấu hình Tailwind CSS styles

Tạo file `src/styles/globals.css` với CSS variables cho theming:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ===== Light Theme Variables ===== */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

/* ===== Dark Theme Variables ===== */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

/* ===== Tailwind Theme Mapping ===== */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

/* ===== Base Styles ===== */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

> **Tìm hiểu thêm**: Xem [Theming](https://ui.shadcn.com/docs/theming) để custom colors theo brand của bạn.

### 5.5. Tạo file `components.json`

Tạo file `components.json` ở thư mục gốc của client. File này cấu hình CLI của shadcn/ui:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/shared/ui/shadcn",
    "utils": "@/shared/utils",
    "ui": "@/shared/ui/shadcn",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "iconLibrary": "lucide"
}

```

| Field         | Giá trị                  | Mô tả                                              |
| ------------- | ------------------------ | -------------------------------------------------- |
| `style`       | `"new-york"`             | Style mặc định (có thể chọn `"default"`)           |
| `rsc`         | `false`                  | Không sử dụng React Server Components              |
| `tsx`         | `true`                   | Sử dụng TypeScript                                 |
| `tailwind.css`| `"src/styles/globals.css"`| Đường dẫn đến file CSS chính                     |
| `aliases.ui`  | `"@/shared/ui/shadcn"`   | Nơi lưu trữ shadcn components                      |
| `iconLibrary` | `"lucide"`               | Thư viện icon mặc định                             |

### 5.6. Thêm components từ shadcn/ui

Sau khi hoàn tất cấu hình, bạn có thể thêm components:

```bash
# Thêm một component
bunx --bun shadcn@latest add button

# Thêm nhiều components cùng lúc
bunx --bun shadcn@latest add button card dialog input form

# Thêm tất cả components (không khuyến khích)
bunx --bun shadcn@latest add --all
```

**Các components thường dùng**:

```bash
# UI cơ bản
bunx --bun shadcn@latest add button input label textarea

# Forms
bunx --bun shadcn@latest add form select checkbox radio-group switch

# Layout & Navigation
bunx --bun shadcn@latest add card dialog sheet tabs dropdown-menu

# Feedback
bunx --bun shadcn@latest add alert toast sonner skeleton

# Data Display
bunx --bun shadcn@latest add table badge avatar separator
```

### 5.7. Import globals.css

Đảm bảo import `globals.css` trong file entry point (`src/index.tsx`):

```typescript
import "./styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 6. Cấu trúc thư mục

```
client/
├── public/                     # Static assets
│   └── favicon.ico
├── src/
│   ├── core/                   # Core application logic
│   │   ├── api/                # API client, interceptors
│   │   ├── config/             # App configuration
│   │   ├── providers/          # React context providers
│   │   ├── router/             # Routing configuration
│   │   └── stores/             # Global state management
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   │   ├── api/            # Auth API calls
│   │   │   ├── components/     # Auth components
│   │   │   ├── hooks/          # Auth hooks
│   │   │   ├── pages/          # Auth pages
│   │   │   ├── types/          # Auth types
│   │   │   └── index.ts        # Module exports
│   │   └── [feature]/          # Other feature modules
│   ├── shared/                 # Shared resources
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utility libraries
│   │   ├── types/              # Shared types
│   │   ├── ui/                 # UI components
│   │   │   └── shadcn/         # shadcn/ui components
│   │   └── utils/              # Utility functions
│   ├── styles/                 # Global styles
│   │   └── globals.css
│   ├── App.tsx                 # Root component
│   ├── index.tsx               # Entry point
│   └── env.d.ts                # Environment types
├── components.json             # shadcn/ui config
├── eslint.config.mjs           # ESLint config
├── package.json
├── postcss.config.mjs          # PostCSS config
├── rsbuild.config.ts           # Rsbuild config
└── tsconfig.json               # TypeScript config
```

---

## 7. Thư viện bổ sung

### 7.1. Routing

```bash
bun add react-router-dom
bun add -D @types/react-router-dom
```

### 7.2. State Management & Data Fetching

```bash
# TanStack Query (React Query)
bun add @tanstack/react-query @tanstack/react-query-devtools

# Zustand (lightweight state management)
bun add zustand
```

### 7.3. Forms & Validation

```bash
# React Hook Form + Zod
bun add react-hook-form @hookform/resolvers zod
```

### 7.4. HTTP Client

```bash
# Axios hoặc ky
bun add axios
# hoặc
bun add ky
```

### 7.5. Date & Time

```bash
bun add date-fns
```

### 7.6. Toast Notifications

```bash
bun add sonner
```

---

## 8. Scripts

| Script    | Command             | Mô tả                          |
| --------- | ------------------- | ------------------------------ |
| `dev`     | `bun run dev`       | Chạy development server        |
| `build`   | `bun run build`     | Build production               |
| `preview` | `bun run preview`   | Preview production build       |
| `lint`    | `bun run lint`      | Kiểm tra linting               |
| `format`  | `bun run format`    | Format code với Prettier       |

---

## 9. Chạy dự án

### Development

```bash
cd client
bun install
bun run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### Production Build

```bash
bun run build
bun run preview
```

---

## 10. Troubleshooting

### Lỗi path alias không hoạt động

1. Kiểm tra `tsconfig.json` đã cấu hình `baseUrl` và `paths`
2. Kiểm tra `rsbuild.config.ts` đã cấu hình `source.alias`
3. Restart IDE/Editor

### Lỗi Tailwind CSS không apply

1. Đảm bảo đã import `globals.css` trong `index.tsx`
2. Kiểm tra file `postcss.config.mjs` tồn tại
3. Restart dev server

### Lỗi shadcn/ui component không tìm thấy

1. Đảm bảo `components.json` đã cấu hình đúng aliases
2. Chạy lại lệnh add component: `bunx shadcn@latest add [component-name]`

---

## Tài liệu tham khảo

- [Rsbuild Documentation](https://rsbuild.rs/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
