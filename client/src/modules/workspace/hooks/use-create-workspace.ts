import { ApiRequestError } from '@/core/api';
import { APP_ROUTES, workspaceKeys } from '@/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
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
  const navigate = useNavigate();

  const mutation = useMutation<
    Workspace,
    ApiRequestError,
    CreateWorkspaceRequest
  >({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const response = await workspaceApi.create(data);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      reset();
      navigate({ to: APP_ROUTES.DASHBOARD });
    },
  });

  return {
    ...mutation,
    mutateAsync: (data: CreateWorkspaceRequest) =>
      toast.promise(mutation.mutateAsync(data), {
        loading: 'Creating workspace...',
        success: 'Workspace created successfully!',
        error: (error: ApiRequestError) =>
          error.message || 'Failed to create workspace.',
      }),
  };
};
