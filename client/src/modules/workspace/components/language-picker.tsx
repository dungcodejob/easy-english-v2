import { Language } from '@/modules/workspace/types/workspace.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';

interface LanguagePickerProps {
  value?: Language;
  onChange: (value: Language) => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.EN]: 'English',
  [Language.VI]: 'Vietnamese',
  [Language.ES]: 'Spanish',
  [Language.FR]: 'French',
  [Language.DE]: 'German',
  [Language.JA]: 'Japanese',
  [Language.KO]: 'Korean',
  [Language.ZH]: 'Chinese',
};

export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as Language)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Language).map((lang) => (
          <SelectItem key={lang} value={lang}>
            {LANGUAGE_LABELS[lang] || lang}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
