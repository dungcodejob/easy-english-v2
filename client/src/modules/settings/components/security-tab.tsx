import { Lock } from 'lucide-react';
import { useState } from 'react';
import { Card, SettingRow, TabHeader, Toggle } from './settings-ui';

export function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  return (
    <div className="space-y-8">
      <TabHeader
        title="Security & Privacy"
        description="Protect your scholarly account with authentication controls, password management, and active session monitoring."
        saveLabel="Update Security"
      />
      <Card
        title="Authentication"
        subtitle="Protect your account with additional layers of security."
      >
        <div>
          <SettingRow
            title="Two-Factor Authentication"
            description="Require a verification code in addition to your password when signing in."
            control={<Toggle checked={twoFactor} onChange={setTwoFactor} />}
          />
          <SettingRow
            title="New Sign-in Alerts"
            description="Receive an email when your account is accessed from a new device or browser."
            control={
              <Toggle checked={sessionAlerts} onChange={setSessionAlerts} />
            }
          />
        </div>
      </Card>

      <Card title="Change Password">
        <div className="space-y-8 max-w-md">
          {[
            { label: 'Current Password', placeholder: '••••••••' },
            { label: 'New Password', placeholder: 'Min. 12 characters' },
            {
              label: 'Confirm New Password',
              placeholder: 'Repeat new password',
            },
          ].map(({ label, placeholder }) => (
            <div key={label} className="group relative">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                {label}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder={placeholder}
                  className="w-full font-headline text-lg font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface pr-8 placeholder:text-on-surface-variant/30"
                />
                <Lock
                  className="absolute right-0 bottom-2.5 size-4 text-on-surface-variant/40"
                  strokeWidth={1.5}
                />
              </div>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-focus-within:w-full" />
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-8 py-3 rounded-full bg-primary text-white font-headline font-medium hover:bg-primary-container transition-colors"
          >
            Update Password
          </button>
        </div>
      </Card>

      <Card
        title="Active Sessions"
        subtitle="Devices currently signed in to your account."
      >
        {[
          {
            device: 'MacBook Pro — Chrome',
            location: 'Ho Chi Minh City, VN',
            current: true,
          },
          {
            device: 'iPhone 15 — Safari',
            location: 'Ho Chi Minh City, VN',
            current: false,
          },
        ].map(({ device, location, current }) => (
          <div
            key={device}
            className="flex items-center justify-between py-4 border-b border-outline-variant/15 last:border-0"
          >
            <div>
              <p className="font-headline font-medium text-on-surface text-sm">
                {device}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {location}
              </p>
            </div>
            {current ? (
              <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                Current
              </span>
            ) : (
              <button
                type="button"
                className="text-xs font-bold text-error hover:underline"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
