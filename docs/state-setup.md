# State Management Setup với TanStack Query

Tài liệu này hướng dẫn cách thiết lập và sử dụng TanStack Query (React Query) làm giải pháp quản lý state cho ứng dụng.

## Tổng quan

TanStack Query được sử dụng để:
- **Server State**: Fetch, cache và đồng bộ dữ liệu từ API
- **Mutations**: Thực hiện các thao tác CRUD với optimistic updates
- **Cache Management**: Quản lý và invalidate cache hiệu quả

## Cấu trúc thư mục

```
src/
├── shared/
│   ├── contexts/
│   │   ├── query-context.tsx    # Query provider & configuration
│   │   └── index.tsx            # Export tất cả providers
│   ├── constants/
│   │   ├── key.ts               # QUERY_KEYS, STORAGE_KEYS, API_KEYS
│   │   └── default-values.ts    # Time constants (MINUTE, HOUR, etc.)
│   └── api/
│       └── api.client.ts        # Axios instance
└── modules/
    └── [module-name]/
        ├── services/            # API service functions
        │   └── [module].api.ts
        ├── hooks/               # React Query hooks
        │   ├── use-[resource].ts
        │   ├── use-[resource]-by-id.ts
        │   ├── use-create-[resource].ts
        │   ├── use-update-[resource].ts
        │   └── use-delete-[resource].ts
        └── types/               # TypeScript types/DTOs
            └── index.ts
```

---

## 1. Query Provider Configuration

### File: `src/shared/contexts/query-context.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MINUTE } from '../constants';

// Logger cho debugging
const logger = {
  log: (...args: unknown[]) => console.log('📘 [Query Log]:', ...args),
  warn: (...args: unknown[]) => console.warn('⚠️ [Query Warning]:', ...args),
  error: (...args: unknown[]) => console.error('❌ [Query Error]:', ...args),
};

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,        // Không refetch khi component mount
      refetchOnWindowFocus: false,  // Không refetch khi focus window
      refetchOnReconnect: false,    // Không refetch khi reconnect
      refetchInterval: false,       // Không auto refetch
      staleTime: 2 * MINUTE,        // Data coi là fresh trong 2 phút
      gcTime: 15 * MINUTE,          // Cache được giữ 15 phút sau khi unmount
      retry: 1,                     // Chỉ retry 1 lần khi fail
    },
    mutations: {
      retry: 1,
    },
  },
});

// Global error handlers
queryClient.getQueryCache().subscribe((event) => {
  if (event.query.state.status === 'error') {
    logger.error('Query Error:', event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  const mutation = event.mutation;
  if (mutation?.state.status === 'error') {
    logger.error('Mutation Error:', mutation.state.error);
  }
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

### Đăng ký Provider trong `src/shared/contexts/index.tsx`

```tsx
import { QueryProvider } from './query-context';
import { ThemeProvider } from './theme-context';

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
};
```

---

## 2. Định nghĩa Query Keys

### File: `src/shared/constants/key.ts`

```ts
export const QUERY_KEYS = {
  AUTH: {
    LOGIN: 'auth-login',
    LOGOUT: 'auth-logout',
    REGISTER: 'auth-register',
  },
  WORKSPACE: 'workspace',
  TOPIC: 'topic',
  WORD: 'word',
  // Thêm keys mới ở đây...
} as const;

export const API_KEYS = {
  TOPIC: 'topic',
  WORD: 'word',
  // API endpoints...
} as const;
```

> [!IMPORTANT]
> Luôn sử dụng constants cho query keys để tránh typo và dễ dàng invalidate cache.

---

## 3. API Service Layer

### File: `src/modules/[module]/services/[module].api.ts`

```ts
import { apiClient } from '@/shared/api/api.client';
import { API_KEYS } from '@/shared/constants';
import type { ListResponseDto, SingleResponseDto } from '@/shared/types/success-response.dto';
import type { CreateTopicDto, Topic, TopicFilters, UpdateTopicDto } from '../types';

export const topicApi = {
  /**
   * Get all topics with optional filters
   */
  getTopics: (params?: TopicFilters & { page?: number; limit?: number }) =>
    apiClient.get<ListResponseDto<Topic>>(`${API_KEYS.TOPIC}`, { params }),

  /**
   * Get a single topic by ID
   */
  getTopicById: (id: string) => 
    apiClient.get<SingleResponseDto<Topic>>(`${API_KEYS.TOPIC}/${id}`),

  /**
   * Create a new topic
   */
  createTopic: (data: CreateTopicDto) =>
    apiClient.post<SingleResponseDto<Topic>>(`${API_KEYS.TOPIC}`, data),

  /**
   * Update an existing topic
   */
  updateTopic: (id: string, data: UpdateTopicDto) =>
    apiClient.put<SingleResponseDto<Topic>>(`${API_KEYS.TOPIC}/${id}`, data),

  /**
   * Delete a topic
   */
  deleteTopic: (id: string) => 
    apiClient.delete(`${API_KEYS.TOPIC}/${id}`),
};
```

---

## 4. React Query Hooks

### 4.1 Query Hook - Fetch List

**File:** `src/modules/[module]/hooks/use-[resources].ts`

```ts
import { QUERY_KEYS } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { topicApi } from '../services';
import type { TopicFilters } from '../types';

export const useTopics = (filters?: TopicFilters & { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOPIC, filters],
    queryFn: async () => {
      const response = await topicApi.getTopics(filters);
      return response.data.items;
    },
  });
};
```

### 4.2 Query Hook - Fetch Single

**File:** `src/modules/[module]/hooks/use-[resource]-by-id.ts`

```ts
import { QUERY_KEYS } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { topicApi } from '../services';

export const useTopicById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOPIC, id],
    queryFn: async () => {
      const response = await topicApi.getTopicById(id);
      return response.data.data;
    },
    enabled: !!id, // Chỉ fetch khi có ID
  });
};
```

### 4.3 Mutation Hook - Create

**File:** `src/modules/[module]/hooks/use-create-[resource].ts`

```ts
import { QUERY_KEYS } from '@/shared/constants';
import { useErrorHandler } from '@/shared/hooks/use-error-handler';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { topicApi } from '../services';
import type { CreateTopicDto } from '../types';

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  const mutation = useMutation({
    mutationFn: async (data: CreateTopicDto) => {
      const response = await topicApi.createTopic(data);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate cache để refetch list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPIC] });
    },
    onError: (error) => {
      handleError(error);
    },
  });

  return {
    ...mutation,
    // Wrap mutateAsync với toast promise
    mutateAsync: (data: CreateTopicDto) =>
      toast.promise(mutation.mutateAsync(data), {
        loading: t('topic.create.creating'),
        success: t('topic.create.success'),
        error: t('topic.create.error'),
      }),
  };
};
```

### 4.4 Mutation Hook - Update

**File:** `src/modules/[module]/hooks/use-update-[resource].ts`

```ts
import { QUERY_KEYS } from '@/shared/constants';
import { useErrorHandler } from '@/shared/hooks/use-error-handler';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { topicApi } from '../services';
import type { UpdateTopicDto } from '../types';

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTopicDto }) => {
      const response = await topicApi.updateTopic(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate cả list và item cụ thể
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPIC] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPIC, variables.id] });
    },
    onError: (error) => {
      handleError(error);
    },
  });

  return {
    ...mutation,
    mutateAsync: (params: { id: string; data: UpdateTopicDto }) =>
      toast.promise(mutation.mutateAsync(params), {
        loading: t('topic.update.updating'),
        success: t('topic.update.success'),
        error: t('topic.update.error'),
      }),
  };
};
```

### 4.5 Mutation Hook - Delete

**File:** `src/modules/[module]/hooks/use-delete-[resource].ts`

```ts
import { QUERY_KEYS } from '@/shared/constants';
import { useErrorHandler } from '@/shared/hooks/use-error-handler';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { topicApi } from '../services';

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await topicApi.deleteTopic(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPIC] });
    },
    onError: (error) => {
      handleError(error);
    },
  });

  return {
    ...mutation,
    mutateAsync: (id: string) =>
      toast.promise(mutation.mutateAsync(id), {
        loading: t('topic.delete.deleting'),
        success: t('topic.delete.success'),
        error: t('topic.delete.error'),
      }),
  };
};
```

---

## 5. Export Hooks

### File: `src/modules/[module]/hooks/index.ts`

```ts
export * from './use-topics';
export * from './use-topic-by-id';
export * from './use-create-topic';
export * from './use-update-topic';
export * from './use-delete-topic';
```

---

## 6. Sử dụng trong Component

```tsx
import { useTopics, useCreateTopic, useDeleteTopic } from '@/modules/topic/hooks';

const TopicListPage = () => {
  const { data: topics, isLoading, error } = useTopics();
  const { mutateAsync: createTopic, isPending: isCreating } = useCreateTopic();
  const { mutateAsync: deleteTopic } = useDeleteTopic();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreate = async () => {
    await createTopic({ name: 'New Topic' });
  };

  const handleDelete = async (id: string) => {
    await deleteTopic(id);
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={isCreating}>
        Add Topic
      </button>
      
      {topics?.map((topic) => (
        <div key={topic.id}>
          {topic.name}
          <button onClick={() => handleDelete(topic.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 7. Best Practices

### Query Key Patterns

| Pattern | Ví dụ | Mô tả |
|---------|-------|-------|
| `[entity]` | `['topic']` | Invalidate tất cả topic queries |
| `[entity, filters]` | `['topic', { status: 'active' }]` | Query với filters |
| `[entity, id]` | `['topic', '123']` | Query single item |
| `[entity, id, 'detail']` | `['topic', '123', 'detail']` | Query nested data |

### Cache Invalidation

```ts
// Invalidate tất cả queries bắt đầu bằng 'topic'
queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPIC] });

// Invalidate exact query
queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPIC, { page: 1 }], exact: true });

// Set data trực tiếp (optimistic update)
queryClient.setQueryData([QUERY_KEYS.TOPIC, id], newData);
```

### Error Handling

Errors được xử lý tự động bởi TanStack Query:
- **Query errors**: Được expose qua `error` property trong hook
- **Mutation errors**: Được handle trong `onError` callback và `useErrorHandler` hook

```ts
const { data, error, isError } = useTopics();

if (isError) {
  console.error('Failed to fetch topics:', error);
}
```

---

## 8. Checklist tạo module mới

- [ ] Tạo types trong `types/index.ts`
- [ ] Thêm QUERY_KEYS trong `shared/constants/key.ts`
- [ ] Thêm API_KEYS nếu cần
- [ ] Tạo API service trong `services/[module].api.ts`
- [ ] Tạo hooks:
  - [ ] `use-[resources].ts` - Fetch list
  - [ ] `use-[resource]-by-id.ts` - Fetch single
  - [ ] `use-create-[resource].ts` - Create
  - [ ] `use-update-[resource].ts` - Update  
  - [ ] `use-delete-[resource].ts` - Delete
- [ ] Export hooks trong `hooks/index.ts`
- [ ] Thêm translations cho toast messages
