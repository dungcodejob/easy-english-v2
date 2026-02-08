import { ApiRequestError } from '@/core/api';
import { workspaceKeys } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../services/workspace.api';
import type { CheckHasWorkspaceResponse } from '../types/workspace.types';

export const useHasWorkspace = () => {
  return useQuery<CheckHasWorkspaceResponse, ApiRequestError>({
    queryKey: workspaceKeys.hasWorkspace(),
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
