import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type { ApiErrorResponse } from '@/core/api';
import { QUERY_KEYS } from '@/shared/constants';
import { workspaceApi } from '../services/workspace.api';
import type { CheckHasWorkspaceResponse } from '../types/workspace.types';

export const useHasWorkspace = () => {
  return useQuery<CheckHasWorkspaceResponse, AxiosError<ApiErrorResponse>>({
    queryKey: [QUERY_KEYS.WORKSPACE, 'check'],
    queryFn: async () => {
      const response = await workspaceApi.checkHasWorkspace();
      if (!response.success) {
        throw new Error(response.error.message);
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    // Don't refetch too aggressively as this is a simple boolean check
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};
