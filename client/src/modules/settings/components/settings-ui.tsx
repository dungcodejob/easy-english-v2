import { cn } from '@/shared/utils';
import { ChevronDown } from 'lucide-react';

export function GhostSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative group">
      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full bg-transparent border-0 border-b border-outline-variant/50 pb-2 pl-0 pr-8 font-headline font-medium text-on-surface focus:border-b-2 focus:border-secondary focus:ring-0 appearance-none transition-all outline-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 bottom-2 size-4 text-on-surface-variant pointer-events-none transition-transform group-hover:translate-y-0.5" />
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2',
        checked ? 'bg-secondary' : 'bg-surface-container-highest',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-5 border-b border-outline-variant/15 last:border-0">
      <div className="pr-8">
        <h3 className="font-headline text-on-surface font-medium mb-0.5">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 mt-0.5">{control}</div>
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/15">
      <header className="mb-8">
        <h2 className="font-headline text-xl font-semibold text-on-primary-fixed">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
}

export function TabHeader({
  title,
  description,
  saveLabel,
}: {
  title: string;
  description: string;
  saveLabel: string;
}) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="max-w-2xl">
        <h1 className="font-headline text-[2.5rem] leading-tight font-semibold text-on-primary-fixed mb-3">
          {title}
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
      <button
        type="button"
        className="self-start md:self-auto bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded-full font-headline font-medium shadow-[0_12px_32px_rgba(26,27,30,0.06)] hover:opacity-95 hover:scale-105 transition-all whitespace-nowrap"
      >
        {saveLabel}
      </button>
    </div>
  );
}
