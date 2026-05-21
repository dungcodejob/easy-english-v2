import { createFileRoute, Link } from '@tanstack/react-router';

import { FormWrapper } from '@/shared/ui/patterns';
import { RegisterForm } from '../../features/register/register.form';

export const Route = createFileRoute('/_(unauthenticated)/register')({
  component: RegisterScreen,
});

export default function RegisterScreen() {
  return (
    <FormWrapper
      title="Create your account"
      subtitle="Fill in the form below to get started"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
          <span className="mt-3 block text-xs text-muted-foreground">
            By creating an account you agree to our{' '}
            <a href="/terms" className="underline hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
            .
          </span>
        </>
      }
    >
      <RegisterForm />
    </FormWrapper>
  );
}
