import { ValueObject } from '@core/ddd';
import { DataSource } from './data-source.vo';
import { Language } from './language.vo';
import { WordPronunciationVO } from './word-pronunciation.vo';
import { WordSenseVO } from './word-sense.vo';
import { WordText } from './word-text.vo';

export interface WordSnapshotProps {
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

export interface WordFamily {
  n?: string[];
  adj?: string[];
  adv?: string[];
  v?: string[];
  head: string;
}

export class WordSnapshot extends ValueObject<WordSnapshotProps> {
  get text(): WordText {
    return this.props.text;
  }

  get normalizedText(): WordText {
    return this.props.normalizedText;
  }

  get language(): Language {
    return this.props.language;
  }

  get source(): DataSource {
    return this.props.source;
  }

  get rank(): number | null {
    return this.props.rank;
  }

  get frequency(): number | null {
    return this.props.frequency;
  }

  get pronunciations(): WordPronunciationVO[] {
    return this.props.pronunciations;
  }

  get senses(): WordSenseVO[] {
    return this.props.senses;
  }

  get inflects(): Record<string, string[]> | undefined {
    return this.props.inflects;
  }

  get wordFamily(): WordFamily | undefined {
    return this.props.wordFamily;
  }
}
