import { api, type ApiSuccessResponse } from '@/core/api';
import type {
  CheckHasWorkspaceResponse,
  CreateWorkspaceRequest,
  Workspace,
} from '../types/workspace.types';

export const workspaceApi = {
  create: async (
    data: CreateWorkspaceRequest,
  ): Promise<ApiSuccessResponse<Workspace>> => {
    return api.post('/workspaces', data);
  },

  checkHasWorkspace: async (): Promise<
    ApiSuccessResponse<CheckHasWorkspaceResponse>
  > => {
    return api.get('/workspaces/check');
  },
};
