/**
 * useToastMutation — Centralized mutation hook with toast + auto-invalidation.
 *
 * Wraps TanStack Query's `useMutation` with two common behaviors:
 *   1. Auto-invalidate specified query keys on success
 *   2. Wrap `mutateAsync` with `toast.promise` for loading/success/error feedback
 *
 * Compatible with `mutationOptions()` — spread options from a mutation factory:
 *
 *   // In topic.queries.ts
 *   export const topicMutations = {
 *     create: () => mutationOptions({
 *       mutationFn: (data: CreateTopicInput) => TopicApi.createTopic(data),
 *     }),
 *   };
 *
 *   // In use-create-topic.ts
 *   export function useCreateTopic() {
 *     return useToastMutation({
 *       options: {
 *         ...topicMutations.create(),
 *         onSuccess: () => {
 *           queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
 *         },
 *       },
 *       toast: {
 *         loading: 'Creating topic...',
 *         success: 'Topic created!',
 *         error: 'Failed to create topic.',
 *       },
 *     });
 *   }
 *
 * For complex mutations (auth, navigation, etc.), use `useMutation` directly.
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────

export interface ToastMessages<TError = Error, TVariables = void> {
  loading: string | ((vars: TVariables) => string);
  success: string | ((vars: TVariables) => string);
  error: string | ((err: TError) => string);
}

export type Input<TData, TError, TVariables, TContext> = {
  options: UseMutationOptions<TData, TError, TVariables, TContext>;
  toast?: ToastMessages<TError, TVariables>;
};

// ── Hook ─────────────────────────────────────────────────────────────

export function useToastMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(input: Input<TData, TError, TVariables, TContext>) {
  const { toast: messages, options: mutationOptions } = input;

  const mutation = useMutation<TData, TError, TVariables, TContext>(
    mutationOptions,
  );

  // Override mutateAsync with toast.promise if messages are provided
  const mutateAsyncWithToast = messages
    ? (variables: TVariables) => {
        const loadingMessage =
          typeof messages.loading === 'function'
            ? messages.loading(variables)
            : messages.loading;
        const successMessage =
          typeof messages.success === 'function'
            ? messages.success(variables)
            : messages.success;

        return toast.promise(mutation.mutateAsync(variables), {
          loading: loadingMessage,
          success: successMessage,
          error: messages.error,
        });
      }
    : mutation.mutateAsync;

  return {
    ...mutation,
    mutateAsync: mutateAsyncWithToast,
  };
}
