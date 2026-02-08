import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceWizard } from '../components/wizard/WorkspaceWizard';

const NewWorkspacePage = () => {
  return <WorkspaceWizard />;
};

export const Route = createFileRoute('/_(unauthenticated)/workspace/new')({
  component: NewWorkspacePage,
});
