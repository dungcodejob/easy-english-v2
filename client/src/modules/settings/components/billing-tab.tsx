import { cn } from '@/shared/utils';
import {
  Check,
  CreditCard,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { TabHeader } from './settings-ui';

// ─── Types ────────────────────────────────────────────────────────────────────

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'other';

interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  holderName: string;
  expiry: string;
  isDefault: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'free',
    name: 'Scholar',
    price: 'Free',
    period: '',
    description: 'The essentials to begin your linguistic journey.',
    features: [
      '1 Workspace',
      '500 words / month',
      'Basic flashcards',
      'Community support',
    ],
    badge: null,
  },
  {
    id: 'pro',
    name: 'Luminary',
    price: '$12',
    period: '/ month',
    description: 'Unlimited depth for the dedicated scholar.',
    features: [
      '5 Workspaces',
      'Unlimited words',
      'AI-powered insights',
      'Spaced repetition engine',
      'Priority support',
    ],
    badge: 'Current Plan',
  },
  {
    id: 'institution',
    name: 'Athenaeum',
    price: '$49',
    period: '/ month',
    description: 'For teams and academic institutions at scale.',
    features: [
      'Unlimited Workspaces',
      'Team analytics dashboard',
      'Custom curriculum import',
      'SSO & admin controls',
      'Dedicated account manager',
    ],
    badge: null,
  },
];

const INVOICES = [
  {
    date: 'Apr 1, 2026',
    amount: '$12.00',
    status: 'Paid',
    id: 'INV-2026-04',
  },
  {
    date: 'Mar 1, 2026',
    amount: '$12.00',
    status: 'Paid',
    id: 'INV-2026-03',
  },
  {
    date: 'Feb 1, 2026',
    amount: '$12.00',
    status: 'Paid',
    id: 'INV-2026-02',
  },
];

const INITIAL_METHODS: PaymentMethod[] = [
  {
    id: 'pm-1',
    brand: 'visa',
    last4: '4242',
    holderName: 'Scholar Account',
    expiry: '09/28',
    isDefault: true,
  },
  {
    id: 'pm-2',
    brand: 'mastercard',
    last4: '1234',
    holderName: 'Scholar Account',
    expiry: '03/27',
    isDefault: false,
  },
];

// ─── Card Brand Helpers ───────────────────────────────────────────────────────

function detectBrand(number: string): CardBrand {
  const n = number.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (n.startsWith('5') || n.startsWith('2')) return 'mastercard';
  if (n.startsWith('3')) return 'amex';
  return 'other';
}

function formatCardNumber(raw: string) {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

const BRAND_STYLES: Record<
  CardBrand,
  { gradient: string; label: string; textColor: string }
> = {
  visa: {
    gradient: 'from-[#1a1f71] to-[#2563eb]',
    label: 'VISA',
    textColor: 'text-white',
  },
  mastercard: {
    gradient: 'from-[#eb001b] to-[#f79e1b]',
    label: 'MC',
    textColor: 'text-white',
  },
  amex: {
    gradient: 'from-[#007b5e] to-[#00b4d8]',
    label: 'AMEX',
    textColor: 'text-white',
  },
  other: {
    gradient: 'from-surface-variant to-outline-variant',
    label: 'CARD',
    textColor: 'text-on-surface-variant',
  },
};

// ─── Card Brand Chip ──────────────────────────────────────────────────────────

function BrandChip({ brand }: { brand: CardBrand }) {
  const s = BRAND_STYLES[brand];
  return (
    <div
      className={cn(
        'w-12 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm',
        s.gradient,
      )}
    >
      <span
        className={cn('text-[9px] font-black tracking-widest', s.textColor)}
      >
        {s.label}
      </span>
    </div>
  );
}

// ─── Payment Methods Section ──────────────────────────────────────────────────

function PaymentMethodsSection() {
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [showForm, setShowForm] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const detectedBrand = detectBrand(cardNumber);

  const handleSetDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleRemove = (id: string) => {
    setMethods((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      // If removed was default, promote first remaining
      if (prev.find((m) => m.id === id)?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    setRemovingId(null);
  };

  const handleAddCard = () => {
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 13 || !holderName || expiry.length < 5) return;

    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      brand: detectedBrand,
      last4: digits.slice(-4),
      holderName,
      expiry,
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);

    setCardNumber('');
    setHolderName('');
    setExpiry('');
    setCvv('');
    setShowForm(false);
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/15">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-xl font-semibold text-on-primary-fixed">
          Payment Methods
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-low transition-all"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add Method
          </button>
        )}
      </div>

      {/* Saved cards list */}
      <div className="space-y-3 mb-4">
        {methods.length === 0 && (
          <div className="py-10 flex flex-col items-center gap-3 text-on-surface-variant/40">
            <CreditCard className="size-10" strokeWidth={1} />
            <p className="text-sm font-medium">No payment methods saved</p>
          </div>
        )}

        {methods.map((method) => (
          <div
            key={method.id}
            className={cn(
              'group relative flex items-center gap-4 p-4 rounded-xl border transition-all',
              method.isDefault
                ? 'bg-surface-container-low border-primary/20 shadow-[0_0_0_1px_rgba(var(--color-primary)/0.12)]'
                : 'bg-surface border-outline-variant/20 hover:bg-surface-container-low hover:border-outline-variant/40',
            )}
          >
            <BrandChip brand={method.brand} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline font-medium text-on-surface text-sm">
                  •••• •••• •••• {method.last4}
                </span>
                {method.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider">
                    <Star className="size-2.5" strokeWidth={2.5} />
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {method.holderName} · Expires {method.expiry}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {!method.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(method.id)}
                  className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                  Set Default
                </button>
              )}

              {removingId === method.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">
                    Remove?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(method.id)}
                    className="text-xs font-bold text-error hover:underline"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemovingId(null)}
                    className="text-xs font-bold text-on-surface-variant hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRemovingId(method.id)}
                  className="p-1.5 rounded-lg text-on-surface-variant/30 hover:text-error hover:bg-error/5 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove card"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add card form */}
      {showForm && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-surface-container-low p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-semibold text-on-surface text-sm flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-5 rounded bg-gradient-to-br text-[8px] font-black flex items-center justify-center text-white transition-all',
                  BRAND_STYLES[detectedBrand].gradient,
                )}
              >
                {BRAND_STYLES[detectedBrand].label}
              </div>
              New Payment Method
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setCardNumber('');
                setHolderName('');
                setExpiry('');
                setCvv('');
              }}
              className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Card number */}
            <div className="group relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Card Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                className="w-full font-headline text-lg font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface placeholder:text-on-surface-variant/30 tracking-widest"
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-focus-within:w-full" />
            </div>

            {/* Holder name */}
            <div className="group relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="As printed on card"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                className="w-full font-headline text-lg font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface placeholder:text-on-surface-variant/30"
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-focus-within:w-full" />
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-6">
              <div className="group relative">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className="w-full font-headline text-lg font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface placeholder:text-on-surface-variant/30"
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
              <div className="group relative">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Security Code
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="CVV"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  className="w-full font-headline text-lg font-medium bg-transparent border-b border-outline-variant/30 focus:border-secondary focus:ring-0 transition-colors py-2 outline-none text-on-surface placeholder:text-on-surface-variant/30"
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-focus-within:w-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              type="button"
              onClick={handleAddCard}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-medium text-sm shadow-sm hover:scale-105 hover:opacity-95 transition-all"
            >
              <Check className="size-4" strokeWidth={2.5} />
              Save Card
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setCardNumber('');
                setHolderName('');
                setExpiry('');
                setCvv('');
              }}
              className="px-6 py-2.5 rounded-full border border-outline-variant/40 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="mt-4 text-[10px] text-on-surface-variant/50 flex items-center gap-1.5">
            <CreditCard className="size-3" strokeWidth={1.5} />
            Your card details are encrypted and stored securely.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function BillingTab() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-10">
      <TabHeader
        title="Billing & Plan"
        description="Manage your subscription, review invoices, and upgrade your scholarly toolkit. Your current plan renews on May 1, 2026."
        saveLabel="Manage Subscription"
      />

      {/* Billing cycle toggle */}
      <div className="flex items-center gap-4">
        <span className="font-headline text-sm font-medium text-on-surface-variant">
          Billing Cycle
        </span>
        <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
          {(['monthly', 'annual'] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBilling(cycle)}
              className={cn(
                'px-4 py-1.5 rounded-lg font-headline text-sm font-medium transition-all duration-200 capitalize',
                billing === cycle
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {cycle}
            </button>
          ))}
        </div>
        {billing === 'annual' && (
          <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
            Save 20%
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isActive = plan.id === 'pro';
          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-xl border-2 p-8 flex flex-col transition-all duration-300',
                isActive
                  ? 'bg-primary border-primary shadow-[0_20px_48px_rgba(0,32,70,0.3)]'
                  : 'bg-surface-container-lowest border-outline-variant/20 hover:shadow-[0_12px_32px_rgba(26,27,30,0.08)] hover:-translate-y-1',
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === 'pro' ? (
                    <Zap
                      className="size-4 text-tertiary-fixed-dim"
                      strokeWidth={2}
                    />
                  ) : plan.id === 'institution' ? (
                    <Sparkles
                      className="size-4 text-on-surface-variant"
                      strokeWidth={1.75}
                    />
                  ) : null}
                  <h3
                    className={cn(
                      'font-headline text-lg font-bold',
                      isActive ? 'text-white' : 'text-on-surface',
                    )}
                  >
                    {plan.name}
                  </h3>
                </div>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    isActive ? 'text-white/70' : 'text-on-surface-variant',
                  )}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span
                  className={cn(
                    'font-headline text-4xl font-black',
                    isActive ? 'text-white' : 'text-primary',
                  )}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={cn(
                      'text-sm ml-1',
                      isActive ? 'text-white/60' : 'text-on-surface-variant',
                    )}
                  >
                    {plan.period}
                    {billing === 'annual' &&
                      plan.price !== 'Free' &&
                      ' billed annually'}
                  </span>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                        isActive ? 'bg-white/20' : 'bg-secondary/10',
                      )}
                    >
                      <Check
                        className={cn(
                          'size-2.5',
                          isActive ? 'text-white' : 'text-secondary',
                        )}
                        strokeWidth={3}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        isActive ? 'text-white/85' : 'text-on-surface-variant',
                      )}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={cn(
                  'w-full py-3 rounded-full font-headline font-medium text-sm transition-all',
                  isActive
                    ? 'bg-white/15 text-white border border-white/20 hover:bg-white/25'
                    : plan.id === 'institution'
                      ? 'bg-primary text-white hover:bg-primary-container hover:scale-[1.02]'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
                )}
              >
                {isActive
                  ? 'Current Plan'
                  : plan.id === 'institution'
                    ? 'Contact Sales'
                    : 'Downgrade'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <PaymentMethodsSection />

      {/* Invoice history */}
      <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/15">
        <h2 className="font-headline text-xl font-semibold text-on-primary-fixed mb-6">
          Invoice History
        </h2>
        <div className="space-y-0">
          {INVOICES.map((inv, i) => (
            <div
              key={inv.id}
              className={cn(
                'flex items-center justify-between py-4',
                i < INVOICES.length - 1 && 'border-b border-outline-variant/15',
              )}
            >
              <div>
                <p className="font-headline font-medium text-on-surface text-sm">
                  {inv.id}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {inv.date}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-headline font-bold text-on-surface text-sm">
                  {inv.amount}
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                  {inv.status}
                </span>
                <button
                  type="button"
                  className="text-xs font-bold text-on-surface-variant hover:text-primary hover:underline transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
