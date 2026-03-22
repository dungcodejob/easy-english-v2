/**
 * LoginForm — Auth module
 *
 * Business logic:
 * - Validates email + password with Zod
 * - Calls the useLogin mutation on submit
 * - Handles server-side error display
 * - "Remember me" persists auth preference
 *
 * UI: 100% delegated to Design System components.
 * No inline Tailwind. No layout logic.
 */

import { APP_ROUTES } from '@/shared/constants';
import { DsButton, DsInput } from '@/shared/ui/base';
import { Field, FieldError, FieldLabel } from '@/shared/ui/shadcn/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/shared/ui';
import { useLogin } from '../hooks/use-login';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    login(data, {
      onSuccess: () => {
        router.navigate({ to: APP_ROUTES.ROOT });
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        setServerError(err.response?.data?.message || 'Failed to login');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="email">Email address</FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isPending}
          {...register('email')}
        />
        {errors.email && <FieldError errors={[errors.email]} />}
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <DsInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isPending}
          trailingIcon={showPassword ? <EyeOff /> : <Eye />}
          onTrailingClick={() => setShowPassword((v) => !v)}
          trailingLabel={showPassword ? 'Hide password' : 'Show password'}
          {...register('password')}
        />
        {errors.password && <FieldError errors={[errors.password]} />}
      </Field>

      {/* Remember me — checkbox is a shadcn primitive, not a DS component */}
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="accent-primary size-4 cursor-pointer rounded"
        />
        Remember me
      </label>

      {serverError && (
        <p role="alert" className="text-center text-sm text-destructive">
          {serverError}
        </p>
      )}

      <DsButton
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isPending}
        loadingLabel="Logging in..."
      >
        Log In
      </DsButton>
    </form>
  );
};
