import { type WordSenseEntity } from './word-sense.entity';
import { type DataSource } from '../value-objects/data-source.vo';
import { type Language } from '../value-objects/language.vo';
import { type WordPronunciationVO } from '../value-objects/word-pronunciation.vo';
import { type WordText } from '../value-objects/word-text.vo';

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
  senses: WordSenseEntity[];
  inflects?: Record<string, string[]>;
  wordFamily?: WordFamily;
}
