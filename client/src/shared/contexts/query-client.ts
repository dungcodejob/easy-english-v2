import { QueryClient } from '@tanstack/react-query';
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
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      staleTime: 2 * MINUTE,
      gcTime: 15 * MINUTE,
      retry: 1,
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
