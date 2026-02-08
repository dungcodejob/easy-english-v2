import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceWizard } from '../components/wizard/workspace-wizard';

const NewWorkspacePage = () => {
  return <WorkspaceWizard />;
};

export const Route = createFileRoute('/_(unauthenticated)/workspace/new')({
  component: NewWorkspacePage,
});
