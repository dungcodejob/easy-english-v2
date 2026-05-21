import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ObjectValues } from '../utils';

export const Theme = {
  Light: 'light',
  Dark: 'dark',
  System: 'system',
} as const;

export type AppearanceTheme = ObjectValues<typeof Theme>;

export const AccentColor = {
  Amber: 'amber',
  Teal: 'teal',
  Blue: 'blue',
  Umber: 'umber',
} as const;

export const Language = {
  English: 'English',
  Vietnamese: 'Vietnamese',
} as const;

export type AccentColor = ObjectValues<typeof AccentColor>;
export type Language = ObjectValues<typeof Language>;

interface AppearanceState {
  resolvedTheme: AppearanceTheme;
  textScale: number;
  useBrowserFont: boolean;
  dyslexicFont: boolean;
  language: string;
  region: string;
  dateFormat: string;
  accentColor: AccentColor;
}

interface AppearanceActions {
  setTheme: (theme: AppearanceTheme) => void;
  setTextScale: (v: number) => void;
  setUseBrowserFont: (v: boolean) => void;
  setDyslexicFont: (v: boolean) => void;
  setLanguage: (v: string) => void;
  setRegion: (v: string) => void;
  setDateFormat: (v: string) => void;
  setAccentColor: (v: AccentColor) => void;
}

export const region = {
  unitedStates: 'United States',
  vietnam: 'Vietnam',
} as const;

export type Region = ObjectValues<typeof region>;

export const DateFormat = {
  mmddyyyy: 'MM/DD/YYYY',
  ddmmyyyy: 'DD/MM/YYYY',
} as const;

export type DateFormat = ObjectValues<typeof DateFormat>;

const defaultState: AppearanceState = {
  resolvedTheme: Theme.System,
  textScale: 50,
  useBrowserFont: false,
  dyslexicFont: false,
  language: Language.English,
  region: 'United States',
  dateFormat: DateFormat.ddmmyyyy,
  accentColor: AccentColor.Amber,
};

export const useAppearanceStore = create<AppearanceState & AppearanceActions>()(
  persist(
    (set) => ({
      ...defaultState,

      setTheme: (resolvedTheme) => set({ resolvedTheme }),
      setTextScale: (textScale) => set({ textScale }),
      setUseBrowserFont: (useBrowserFont) => set({ useBrowserFont }),
      setDyslexicFont: (dyslexicFont) => set({ dyslexicFont }),
      setLanguage: (language) => set({ language }),
      setRegion: (region) => set({ region }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    {
      name: 'appearance-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resolvedTheme: state.resolvedTheme,
        textScale: state.textScale,
        useBrowserFont: state.useBrowserFont,
        dyslexicFont: state.dyslexicFont,
        language: state.language,
        region: state.region,
        dateFormat: state.dateFormat,
        accentColor: state.accentColor,
      }),
    },
  ),
);

export const useAppearanceActions = () =>
  useAppearanceStore<AppearanceActions>((s) => s);
export const useAppearanceState = () =>
  useAppearanceStore<AppearanceState>((s) => s);
export const useTheme = () => useAppearanceStore((s) => s.resolvedTheme);
