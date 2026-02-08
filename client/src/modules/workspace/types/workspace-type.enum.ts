import type { ObjectValues } from '@/shared/utils';

export const WorkspaceType = {
  Personal: 'Personal',
  Team: 'Team',
  Classroom: 'Classroom',
} as const;

export type WorkspaceType = ObjectValues<typeof WorkspaceType>;

const WorkspaceTypeLabels: Record<WorkspaceType, string> = {
  [WorkspaceType.Personal]: 'Personal',
  [WorkspaceType.Team]: 'Team',
  [WorkspaceType.Classroom]: 'Classroom',
};

export const WorkspaceTypeOptions = Object.values(WorkspaceType).map(
  (value) => ({
    value,
    label: WorkspaceTypeLabels[value],
  }),
);

export const getWorkspaceTypeLabel = (type: WorkspaceType) => {
  return WorkspaceTypeLabels[type];
};
