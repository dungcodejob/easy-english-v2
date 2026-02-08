import { api, type ApiResponseEnvelope } from '@/core/api';
import type {
  CheckHasWorkspaceResponse,
  CreateWorkspaceRequest,
  Workspace,
} from '../types/workspace.types';

export const workspaceApi = {
  create: async (
    data: CreateWorkspaceRequest,
  ): Promise<ApiResponseEnvelope<Workspace>> => {
    return api.post('/workspaces', data);
  },

  checkHasWorkspace: async (): Promise<
    ApiResponseEnvelope<CheckHasWorkspaceResponse>
  > => {
    return api.get('/workspaces/check');
  },
};
