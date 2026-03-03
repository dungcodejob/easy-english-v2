import { DataSource } from '../value-objects/data-source.vo';
import { Language } from '../value-objects/language.vo';
import { WordPronunciationVO } from '../value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../value-objects/word-sense.vo';
import { WordText } from '../value-objects/word-text.vo';

export interface WordFamily {
  n?: string[];
  adj?: string[];
  adv?: string[];
  v?: string[];
  head: string;
}

export interface WordProps {
  text: WordText;
  normalizedText: WordText;
  language: Language;
  source: DataSource;
  rank: number | null;
  frequency: number | null;
  pronunciations: WordPronunciationVO[];
  senses: WordSenseVO[];
  inflects?: Record<string, string[]>;
  wordFamily?: WordFamily;
}
