import { DsButton, DsInput } from '@/shared/ui/base';
import { Field, FieldError, FieldLabel } from '@/shared/ui/shadcn/field';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AppRoutes } from '@/shared/constants';
import { Input } from '@/shared/ui';
import {
  loginSchema,
  type LoginFormData,
} from '../../models/login-form.schema';
import { useLogin } from './use-login';

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
        router.navigate({ to: AppRoutes.root() });
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } };
        setServerError(error.response?.data?.message || 'Failed to login');
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
