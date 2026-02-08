import { ApiRequestError } from '@/core/api';
import { QUERY_KEYS } from '@/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workspaceApi } from '../services/workspace.api';
import { useWizardActions } from '../stores/use-wizard-store';
import type {
  CreateWorkspaceRequest,
  Workspace,
} from '../types/workspace.types';

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const { reset } = useWizardActions();

  return useMutation<Workspace, ApiRequestError, CreateWorkspaceRequest>({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const response = await workspaceApi.create(data);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Workspace created successfully!');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKSPACE] });
      reset();
      // navigate({ to: APP_ROUTES.WORKSPACE.LIST });
    },
    onError: (error) => {
      // error is now ApiRequestError with structured info
      toast.error(error.message || 'Failed to create workspace.');
    },
  });
};
