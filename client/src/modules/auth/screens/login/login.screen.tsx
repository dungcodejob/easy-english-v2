import { FormWrapper } from '@/shared/ui/patterns';
import { Separator } from '@/shared/ui/shadcn/separator';
import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '../../features/login/login.form';
import { SocialAuthButtons } from './social-auth-buttons';

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-3">
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 328 329"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-8"
      >
        <rect
          y="0.5"
          width="328"
          height="328"
          rx="164"
          className="fill-foreground"
        />
        <path
          d="M165.018 72.3008V132.771C165.018 152.653 148.9 168.771 129.018 168.771H70.2288"
          stroke="var(--primary-foreground)"
          strokeWidth="20"
        />
        <path
          d="M166.627 265.241L166.627 204.771C166.627 184.889 182.744 168.771 202.627 168.771L261.416 168.771"
          stroke="var(--primary-foreground)"
          strokeWidth="20"
        />
        <line
          x1="238.136"
          y1="98.8184"
          x2="196.76"
          y2="139.707"
          stroke="var(--primary-foreground)"
          strokeWidth="20"
        />
        <line
          x1="135.688"
          y1="200.957"
          x2="94.3128"
          y2="241.845"
          stroke="var(--primary-foreground)"
          strokeWidth="20"
        />
        <line
          x1="133.689"
          y1="137.524"
          x2="92.5566"
          y2="96.3914"
          stroke="var(--primary-foreground)"
          strokeWidth="20"
        />
        <line
          x1="237.679"
          y1="241.803"
          x2="196.547"
          y2="200.671"
          stroke="var(--primary-foreground)"
          strokeWidth="20"
        />
      </svg>
      <span className="text-xl font-semibold text-foreground">
        Easy English
      </span>
    </div>
  );
}

function OrSeparator() {
  return (
    <div className="flex items-center gap-4">
      <Separator className="flex-1" />
      <p className="text-sm text-muted-foreground">or</p>
      <Separator className="flex-1" />
    </div>
  );
}

export const Route = createFileRoute('/_(unauthenticated)/login')({
  component: LoginScreen,
});

export default function LoginScreen() {
  return (
    <FormWrapper
      variant="centered"
      headerTop={<BrandMark />}
      title="Log in to your account"
      subtitle="Please enter your details to log in"
      footer={
        <p className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a
            href="/register"
            className="text-foreground font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      }
    >
      <SocialAuthButtons className="mb-4" />
      <OrSeparator />
      <LoginForm />
    </FormWrapper>
  );
}
