import { cn } from '@/shared/utils';
import { createFileRoute } from '@tanstack/react-router';
import { Bell, CreditCard, Globe, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { AccountTab } from '../components/account-tab';
import { BillingTab } from '../components/billing-tab';
import { GeneralTab } from '../components/general-tab';
import { NotificationsTab } from '../components/notifications-tab';
import { SecurityTab } from '../components/security-tab';

type TabId = 'general' | 'account' | 'notifications' | 'security' | 'billing';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'general',
    label: 'General',
    icon: <Globe className="size-4" strokeWidth={1.75} />,
  },
  {
    id: 'account',
    label: 'Account',
    icon: <User className="size-4" strokeWidth={1.75} />,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="size-4" strokeWidth={1.75} />,
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="size-4" strokeWidth={1.75} />,
  },
  {
    id: 'billing',
    label: 'Billing & Plan',
    icon: <CreditCard className="size-4" strokeWidth={1.75} />,
  },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  return (
    <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
      <div className="border-b border-outline-variant/30 mb-10">
        <nav
          aria-label="Settings tabs"
          className="-mb-px flex gap-8 overflow-x-auto font-headline font-medium"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 text-sm md:text-base transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:border-outline-variant hover:text-on-surface',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'billing' && <BillingTab />}
      </div>

      <div className="h-16" />
    </main>
  );
}

export const Route = createFileRoute('/_(authenticated)/settings')({
  component: SettingsPage,
});

export default SettingsPage;
