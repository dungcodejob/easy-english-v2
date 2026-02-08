import { ApiRequestError } from '@/core/api';
import { QUERY_KEYS } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../services/workspace.api';
import type { CheckHasWorkspaceResponse } from '../types/workspace.types';

export const useHasWorkspace = () => {
  return useQuery<CheckHasWorkspaceResponse, ApiRequestError>({
    queryKey: [QUERY_KEYS.WORKSPACE, 'check'],
    queryFn: async () => {
      const response = await workspaceApi.checkHasWorkspace();
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
