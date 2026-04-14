/**
 * useOptimisticMutation — Reusable optimistic mutation with automatic rollback.
 *
 * Handles the full optimistic update lifecycle:
 *   1. Cancel outgoing refetches (prevent overwriting optimistic data)
 *   2. Snapshot previous cache data
 *   3. Apply optimistic update to cache immediately
 *   4. Rollback on error
 *   5. Invalidate on settled (always sync with server)
 *
 * Built-in strategies for common operations:
 *   - `updateInList`  — update an item in a cached list
 *   - `addToList`     — prepend/append an item to a cached list
 *   - `removeFromList` — remove an item from a cached list
 *   - `custom`        — provide your own updater function
 *
 * Accepts `UseMutationOptions` so you can spread from `mutationOptions()`:
 *
 * ─── Why no toast.promise? ───────────────────────────────────────────
 *
 * Optimistic updates update the UI instantly. Showing a "Loading..." toast
 * contradicts this (user sees the result but toast says "loading").
 * A "Success!" toast is redundant — the user already sees the change.
 * Only an **error toast** is useful — to inform the user that a rollback happened.
 *
 * ─── Usage examples ─────────────────────────────────────────────────
 *
 *  // 1. With mutationOptions() factory (recommended)
 *  useOptimisticMutation({
 *    options: {
 *      ...topicMutations.delete(),
 *    },
 *    queryKey: topicKeys.lists(),
 *    updater: {
 *      type: 'removeFromList',
 *      getId: (item) => item.id,
 *      getIdFromVars: (vars) => vars,
 *    },
 *    errorToast: 'Failed to delete. Your change has been reverted.',
 *  });
 *
 *  // 2. Update an item in a list
 *  useOptimisticMutation({
 *    options: {
 *      mutationFn: ({ id, name }) => TopicApi.updateTopic(id, name),
 *    },
 *    queryKey: topicKeys.lists(),
 *    updater: {
 *      type: 'updateInList',
 *      getId: (item) => item.id,
 *      getIdFromVars: (vars) => vars.id,
 *      merge: (old, vars) => ({ ...old, name: vars.name }),
 *    },
 *    errorToast: (err) => `Update failed: ${err.message}`,
 *  });
 *
 *  // 3. Add to list
 *  useOptimisticMutation({
 *    options: {
 *      mutationFn: (data) => TopicApi.createTopic(data),
 *    },
 *    queryKey: topicKeys.lists(),
 *    updater: {
 *      type: 'addToList',
 *      createOptimisticItem: (vars) => ({ id: crypto.randomUUID(), ...vars }),
 *      position: 'prepend',
 *    },
 *    errorToast: 'Failed to create topic.',
 *  });
 *
 *  // 4. Custom updater (full control)
 *  useOptimisticMutation({
 *    options: {
 *      mutationFn: (data) => Api.doSomething(data),
 *    },
 *    queryKey: someKeys.detail(id),
 *    updater: {
 *      type: 'custom',
 *      apply: (oldData, vars) => ({ ...oldData, count: oldData.count + 1 }),
 *    },
 *  });
 */

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';

// ── Updater Strategies ───────────────────────────────────────────────

/** Update a specific item inside a cached array. */
interface UpdateInListStrategy<TItem, TVariables> {
  type: 'updateInList';
  /** Extract the unique identifier from a cached item. */
  getId: (item: TItem) => string | number;
  /** Extract the identifier being mutated from the mutation variables. */
  getIdFromVars: (vars: TVariables) => string | number;
  /** Produce the optimistic item by merging old item + vars. */
  merge: (oldItem: TItem, vars: TVariables) => TItem;
}

/** Add a new optimistic item to a cached array. */
interface AddToListStrategy<TItem, TVariables> {
  type: 'addToList';
  /** Create the optimistic item from mutation variables. */
  createOptimisticItem: (vars: TVariables) => TItem;
  /** Insert at the start or end. @default 'prepend' */
  position?: 'prepend' | 'append';
}

/** Remove an item from a cached array. */
interface RemoveFromListStrategy<TItem, TVariables> {
  type: 'removeFromList';
  /** Extract the unique identifier from a cached item. */
  getId: (item: TItem) => string | number;
  /** Extract the identifier to remove from the mutation variables. */
  getIdFromVars: (vars: TVariables) => string | number;
}

/** Full custom control — you manage the cache transformation. */
interface CustomStrategy<TCacheData, TVariables> {
  type: 'custom';
  /** Produce new cache data from old data + vars. */
  apply: (oldData: TCacheData, vars: TVariables) => TCacheData;
}

export type UpdaterStrategy<TCacheData, TItem, TVariables> =
  | UpdateInListStrategy<TItem, TVariables>
  | AddToListStrategy<TItem, TVariables>
  | RemoveFromListStrategy<TItem, TVariables>
  | CustomStrategy<TCacheData, TVariables>;

// ── Input ────────────────────────────────────────────────────────────

export interface OptimisticMutationInput<
  TData,
  TError,
  TVariables,
  TContext,
  TCacheData,
  TItem,
> {
  /**
   * Standard TanStack Query mutation options.
   * Spread from `mutationOptions()` or define inline.
   *
   * You can provide `onSuccess` / `onError` here — they will be called
   * AFTER the built-in optimistic rollback/invalidation logic.
   */
  options: UseMutationOptions<TData, TError, TVariables, TContext>;
  /** The query key whose cache will be optimistically updated. */
  queryKey: QueryKey;
  /** How to optimistically transform the cached data. */
  updater: UpdaterStrategy<TCacheData, TItem, TVariables>;
  /**
   * Query keys to invalidate after the mutation settles (success or error).
   * Ensures the cache eventually syncs with the server.
   * If not provided, defaults to `[queryKey]`.
   */
  invalidateKeys?: QueryKey[];
  /**
   * Toast message shown when the mutation fails and the optimistic update
   * is rolled back. Only error toast makes sense for optimistic updates:
   * - Loading toast would contradict the instant UI update
   * - Success toast is redundant since the user already sees the change
   */
  errorToast?: string | ((error: TError) => string);
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useOptimisticMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
  TCacheData = unknown,
  TItem = unknown,
>(input: OptimisticMutationInput<TData, TError, TVariables, TContext, TCacheData, TItem>) {
  const {
    options,
    queryKey,
    updater,
    invalidateKeys,
    errorToast,
  } = input;

  const {
    onMutate: userOnMutate,
    onError: userOnError,
    onSuccess: userOnSuccess,
    onSettled: userOnSettled,
    ...restOptions
  } = options;

  const queryClient = useQueryClient();
  const keysToInvalidate = invalidateKeys ?? [queryKey];

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    ...restOptions,

    onMutate: async (variables, context) => {
      // 1. Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot previous cache value
      const previousData = queryClient.getQueryData<TCacheData>(queryKey);

      // 3. Apply optimistic update
      if (previousData !== undefined) {
        queryClient.setQueryData<TCacheData>(queryKey, (old) => {
          if (old === undefined) return old;
          return applyUpdater(old, variables, updater);
        });
      }

      // 4. Call user's onMutate if provided, then return combined context
      const userContext = await userOnMutate?.(variables, context);

      // Return merged context: our snapshot + whatever user returned
      return {
        ...userContext,
        __optimistic_previousData: previousData,
      } as TContext;
    },

    onError: (error, variables, onMutateResult, context) => {
      // Rollback to snapshot
      const result = onMutateResult as TContext & {
        __optimistic_previousData?: TCacheData;
      } | undefined;
      if (result?.__optimistic_previousData !== undefined) {
        queryClient.setQueryData<TCacheData>(
          queryKey,
          result.__optimistic_previousData,
        );
      }
      // Show error toast on rollback (the only toast that makes sense here)
      if (errorToast) {
        const message =
          typeof errorToast === 'function' ? errorToast(error) : errorToast;
        toast.error(message);
      }
      // Delegate to user's onError
      userOnError?.(error, variables, onMutateResult, context);
    },

    onSuccess: (data, variables, onMutateResult, context) => {
      // Delegate to user's onSuccess
      userOnSuccess?.(data, variables, onMutateResult, context);
    },

    onSettled: (data, error, variables, onMutateResult, context) => {
      // Always invalidate to sync with server truth
      for (const key of keysToInvalidate) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      // Delegate to user's onSettled
      userOnSettled?.(data, error, variables, onMutateResult, context);
    },
  });

  return mutation;
}

// ── Updater Application ──────────────────────────────────────────────

function applyUpdater<TCacheData, TItem, TVariables>(
  oldData: TCacheData,
  variables: TVariables,
  strategy: UpdaterStrategy<TCacheData, TItem, TVariables>,
): TCacheData {
  switch (strategy.type) {
    case 'updateInList': {
      const list = oldData as TItem[];
      const targetId = strategy.getIdFromVars(variables);
      return list.map((item) =>
        strategy.getId(item) === targetId
          ? strategy.merge(item, variables)
          : item,
      ) as TCacheData;
    }

    case 'addToList': {
      const list = oldData as TItem[];
      const newItem = strategy.createOptimisticItem(variables);
      const position = strategy.position ?? 'prepend';
      return (
        position === 'prepend' ? [newItem, ...list] : [...list, newItem]
      ) as TCacheData;
    }

    case 'removeFromList': {
      const list = oldData as TItem[];
      const targetId = strategy.getIdFromVars(variables);
      return list.filter(
        (item) => strategy.getId(item) !== targetId,
      ) as TCacheData;
    }

    case 'custom': {
      return strategy.apply(oldData, variables);
    }
  }
}
