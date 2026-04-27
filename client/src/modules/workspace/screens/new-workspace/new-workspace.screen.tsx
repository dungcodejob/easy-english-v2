import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceWizard } from '../../features/create-workspace/workspace-wizard';

export const Route = createFileRoute(
  '/_(authenticated-fullscreen)/workspace/new',
)({
  component: NewWorkspaceScreen,
});

function NewWorkspaceScreen() {
  return <WorkspaceWizard />;
}

export default NewWorkspaceScreen;
