import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import type { ApiErrorResponse } from '@/core/api';
import { QUERY_KEYS } from '@/shared/constants';
import { workspaceApi } from '../services/workspace.api';
import { useWizardActions } from '../stores/use-wizard-store';
import type {
  CreateWorkspaceRequest,
  Workspace,
} from '../types/workspace.types';

export const useCreateWorkspace = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { reset } = useWizardActions();

  return useMutation<
    Workspace,
    AxiosError<ApiErrorResponse>,
    CreateWorkspaceRequest
  >({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const response = await workspaceApi.create(data);
      if (!response.success) {
        throw new Error(response.error.message);
      }
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Workspace created successfully!');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKSPACE] });
      reset();
      //   navigate({ to: APP_ROUTES.WORKSPACE.LIST });
    },
    onError: (error) => {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create workspace.';
      toast.error(message);
    },
  });
};
