import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_(authenticated)/dictionary')({
  component: DictionaryLayout,
});

export default function DictionaryLayout() {
  return <Outlet />;
}
