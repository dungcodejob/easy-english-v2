import { ClarionInput, FormField } from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, TabHeader } from './settings-ui';

const accountFormSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.email('Invalid email address'),
  bio: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const accountFormDefaultValues: AccountFormValues = {
  displayName: 'Scholar',
  email: 'scholar@sanctuary.edu',
  bio: 'Pursuing excellence in academic vocabulary and linguistic mastery.',
};

export function AccountTab() {
  const { control, handleSubmit, watch } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      ...accountFormDefaultValues,
    },
  });

  const displayName = watch('displayName');

  return (
    <div className="space-y-8">
      <TabHeader
        title="My Account"
        description="Manage your personal information, scholar identity, and account data. Changes here are visible across all your workspaces."
        saveLabel="Update Profile"
      />
      <Card
        title="Profile Identity"
        subtitle="How you appear across the platform."
      >
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-3xl font-headline font-bold shadow-lg">
              {displayName.charAt(0)}
            </div>
            <button
              type="button"
              className="text-xs font-bold text-secondary hover:underline"
            >
              Change Avatar
            </button>
          </div>
          <div className="flex-1 space-y-8">
            <FormField
              name="displayName"
              control={control}
              label="Display Name"
            >
              {({ field, fieldState }) => (
                <ClarionInput
                  {...field}
                  placeholder="e.g. Scholar"
                  maxLength={100}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
              )}
            </FormField>

            <FormField name="email" control={control} label="Email Address">
              {({ field, fieldState }) => (
                <ClarionInput
                  {...field}
                  type="email"
                  placeholder="e.g. [EMAIL_ADDRESS]"
                  maxLength={100}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
              )}
            </FormField>
          </div>
        </div>

        <div className="mt-8 group relative">
          <FormField name="bio" control={control} label="Scholar Bio">
            {({ field, fieldState }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full bg-surface-container-low rounded-lg p-4 text-sm text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
              />
            )}
          </FormField>

          {/* <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Scholar Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-surface-container-low rounded-lg p-4 text-sm text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all"
          /> */}
        </div>
      </Card>

      <Card title="Danger Zone">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-outline-variant/15">
            <div>
              <p className="font-headline font-medium text-on-surface">
                Export My Data
              </p>
              <p className="text-sm text-on-surface-variant">
                Download a full archive of your learning data.
              </p>
            </div>
            <button
              type="button"
              className="px-5 py-2 rounded-full border border-outline-variant text-sm font-bold text-on-surface hover:bg-surface-container transition-colors"
            >
              Export
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-headline font-medium text-error">
                Delete Account
              </p>
              <p className="text-sm text-on-surface-variant">
                Permanently remove your account and all data.
              </p>
            </div>
            <button
              type="button"
              className="px-5 py-2 rounded-full border border-error/30 text-sm font-bold text-error hover:bg-error hover:text-white transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
