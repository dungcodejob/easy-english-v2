import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceWizard } from '../components/new-wizard/workspace-wizard';

const NewWorkspacePage = () => {
  return <WorkspaceWizard />;
};

export const Route = createFileRoute('/_(authenticated-fullscreen)/workspace/new')({
  component: NewWorkspacePage,
});
