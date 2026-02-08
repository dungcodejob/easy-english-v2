import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_(authenticated)/dashboard')({
  component: DashboardPage,
});

export default function DashboardPage() {
  return <div>Dashboard</div>;
}
