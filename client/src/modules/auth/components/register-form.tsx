import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/shared/ui/shadcn/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/shadcn/field';
import { Input } from '@/shared/ui/shadcn/input';
import { useRegister } from '../hooks/use-register';
import { PasswordInput } from './password-input';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  tenantName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister();

  const { control, handleSubmit } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      tenantName: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    register(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        tenantName: data.tenantName || data.name, // Default tenant name to user name if empty
      },
      {
        onSuccess: () => {
          toast.success('Registration successful!', {
            description: 'You can now log in.',
          });
        },
        onError: (error) => {
          toast.error('Registration failed', {
            description: error.message || 'Something went wrong',
          });
        },
      },
    );
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Fill in the form below to create your account
            </p>
          </div>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="John Doe"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isPending}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <PasswordInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Password"
                  disabled={isPending}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="tenantName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Workspace Name (Optional)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="My Workspace"
                  type="text"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
