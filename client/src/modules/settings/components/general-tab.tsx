import { cn } from '@/shared/utils';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Card,
  GhostSelect,
  SettingRow,
  TabHeader,
  Toggle,
} from './settings-ui';

type Theme = 'light' | 'dark' | 'system';

const ACCENT_COLORS = [
  { id: 'amber', bg: 'bg-tertiary-fixed-dim', ring: 'ring-tertiary-container' },
  { id: 'teal', bg: 'bg-secondary', ring: 'ring-secondary' },
  { id: 'blue', bg: 'bg-primary-fixed', ring: 'ring-primary' },
  { id: 'umber', bg: 'bg-[#8a5a44]', ring: 'ring-[#8a5a44]' },
];

const LANGUAGES = [
  'English (United States)',
  'Tiếng Việt',
  'Français (France)',
];
const REGIONS = ['United States', 'United Kingdom', 'Europe', 'Asia Pacific'];
const DATE_FORMATS = [
  'System Default (MM/DD/YYYY)',
  'European (DD/MM/YYYY)',
  'ISO 8601 (YYYY-MM-DD)',
];

const THEMES: {
  id: Theme;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'light',
    label: 'Library Light',
    description: 'Crisp white canvas',
    icon: <Sun className="size-5" strokeWidth={1.75} />,
  },
  {
    id: 'dark',
    label: 'Midnight Focus',
    description: 'Deep dark immersion',
    icon: <Moon className="size-5" strokeWidth={1.75} />,
  },
  {
    id: 'system',
    label: 'Follow System',
    description: 'Adapts to your OS',
    icon: <Monitor className="size-5" strokeWidth={1.75} />,
  },
];

export function GeneralTab() {
  const [theme, setTheme] = useState<Theme>('light');
  const [systemPrefers, setSystemPrefers] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefers(mq.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) =>
      setSystemPrefers(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const [textScale, setTextScale] = useState(50);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0]);
  const [accentColor, setAccentColor] = useState('amber');

  const scaleLabel =
    textScale < 30
      ? 'Compact'
      : textScale < 70
        ? 'Default (100%)'
        : 'Comfortable';

  return (
    <div className="space-y-8">
      <TabHeader
        title="System Preferences"
        description="Customize your Scholarly Sanctuary. Adjust typography, interface themes, and regional logic to perfectly suit your study habits."
        saveLabel="Save Preferences"
      />

      <Card
        title="Interface Theme"
        subtitle="Manage lighting and contrast modes. 'Follow System' automatically switches with your OS."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  'cursor-pointer relative rounded-lg p-5 border-2 transition-all text-left group',
                  isActive
                    ? 'border-primary bg-surface-container-low shadow-[0_4px_16px_rgba(26,27,30,0.06)]'
                    : 'border-transparent bg-surface hover:bg-surface-container-low hover:border-outline-variant/30',
                )}
              >
                {/* Radio + Icon row */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-container text-on-surface-variant',
                    )}
                  >
                    {t.icon}
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      isActive ? 'border-primary' : 'border-outline/50',
                    )}
                  >
                    {isActive && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </div>
                </div>

                {/* Preview thumbnail */}
                {t.id === 'light' && (
                  <div className="h-14 rounded-md bg-[#f8f8f5] border border-outline-variant/20 overflow-hidden flex flex-col p-2 gap-1.5 mb-4">
                    <div className="h-2 w-2/5 bg-[#e2e2dd] rounded-sm" />
                    <div className="h-7 w-full bg-[#eeede9] rounded-sm" />
                  </div>
                )}
                {t.id === 'dark' && (
                  <div className="h-14 rounded-md bg-[#1a1b1e] border border-white/5 overflow-hidden flex flex-col p-2 gap-1.5 mb-4">
                    <div className="h-2 w-2/5 bg-[#2f3033] rounded-sm" />
                    <div className="h-7 w-full bg-[#26272b] rounded-sm" />
                  </div>
                )}
                {t.id === 'system' && (
                  <div className="h-14 rounded-md overflow-hidden border border-outline-variant/20 mb-4 relative">
                    {/* Left half — light */}
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-[#f8f8f5] flex flex-col p-2 gap-1.5">
                      <div className="h-2 w-3/5 bg-[#e2e2dd] rounded-sm" />
                      <div className="h-7 w-full bg-[#eeede9] rounded-sm" />
                    </div>
                    {/* Right half — dark */}
                    <div className="absolute inset-y-0 right-0 w-1/2 bg-[#1a1b1e] flex flex-col p-2 gap-1.5">
                      <div className="h-2 w-3/5 bg-[#2f3033] rounded-sm" />
                      <div className="h-7 w-full bg-[#26272b] rounded-sm" />
                    </div>
                    {/* Diagonal divider */}
                    <div
                      className="absolute inset-y-0 left-1/2 w-px bg-outline-variant/30 -translate-x-1/2"
                      style={{ clipPath: 'none' }}
                    />
                  </div>
                )}

                <p className="font-headline font-semibold text-on-surface text-sm leading-tight">
                  {t.label}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {t.id === 'system'
                    ? `Currently ${systemPrefers}`
                    : t.description}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card
        title="Reading Environment"
        subtitle="Adjust typography and scale for optimal comprehension."
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-on-surface font-medium">
              Text Scale
            </h3>
            <span className="text-sm text-on-surface-variant font-medium bg-surface-container-high px-2 py-1 rounded-md">
              {scaleLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-on-surface-variant font-headline">
              A
            </span>
            <input
              type="range"
              min="1"
              max="100"
              value={textScale}
              onChange={(e) => setTextScale(Number(e.target.value))}
              className="w-full h-1 bg-surface-variant rounded-full appearance-none cursor-pointer accent-secondary"
            />
            <span className="text-xl text-on-surface-variant font-headline">
              A
            </span>
          </div>
          <SettingRow
            title="OpenDyslexic Font"
            description="Override editorial typography with an accessibility-focused typeface designed to mitigate symptoms of dyslexia."
            control={
              <Toggle checked={dyslexicFont} onChange={setDyslexicFont} />
            }
          />
        </div>
      </Card>

      <Card title="Language & Region">
        <div className="space-y-8">
          <GhostSelect
            label="Primary Instruction Language"
            options={LANGUAGES}
            value={language}
            onChange={setLanguage}
          />
          <GhostSelect
            label="Region"
            options={REGIONS}
            value={region}
            onChange={setRegion}
          />
          <GhostSelect
            label="Date & Time Format"
            options={DATE_FORMATS}
            value={dateFormat}
            onChange={setDateFormat}
          />
        </div>
      </Card>

      <section className="relative overflow-hidden rounded-xl p-8 shadow-[0_12px_32px_rgba(26,27,30,0.06)] border border-outline-variant/15 bg-gradient-to-br from-surface-container-lowest to-surface-container-low">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary-fixed-dim rounded-full blur-3xl opacity-20 pointer-events-none" />
        <header className="mb-6 relative z-10">
          <h2 className="font-headline text-xl font-semibold text-on-primary-fixed">
            Academic Accent
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Select the highlight color for progress rings and milestones.
          </p>
        </header>
        <div className="flex items-center gap-4 relative z-10">
          {ACCENT_COLORS.map((color) => {
            const isActive = accentColor === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => setAccentColor(color.id)}
                className={cn(
                  'rounded-full flex items-center justify-center transition-all hover:scale-110',
                  color.bg,
                  isActive
                    ? `w-12 h-12 ring-2 ring-offset-2 ring-offset-surface ${color.ring} shadow-sm`
                    : 'w-10 h-10 shadow-sm',
                )}
              >
                {isActive && (
                  <Check
                    className="size-4 text-white mix-blend-luminosity"
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
