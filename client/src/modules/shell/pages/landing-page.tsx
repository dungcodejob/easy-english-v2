import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold">Welcome to Easy English</h1>
      <div className="flex gap-4">
        <Link to="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
        <a href="/register" className="text-blue-500 hover:underline">
          Register
        </a>
      </div>
    </div>
  );
}
