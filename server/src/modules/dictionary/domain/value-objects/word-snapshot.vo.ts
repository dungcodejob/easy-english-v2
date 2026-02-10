import { ValueObject } from '@core/ddd';
import { WordPronunciationVO } from './word-pronunciation.vo';
import { WordSenseVO } from './word-sense.vo';

export interface WordSnapshotProps {
  text: string;
  normalizedText: string;
  language: string;
  source: 'internal' | 'azvocab';
  rank: number | null;
  frequency: number | null;
  pronunciations: WordPronunciationVO[];
  senses: WordSenseVO[];
}

export class WordSnapshot extends ValueObject<WordSnapshotProps> {
  get text(): string {
    return this.props.text;
  }

  get normalizedText(): string {
    return this.props.normalizedText;
  }

  get language(): string {
    return this.props.language;
  }

  get source(): 'internal' | 'azvocab' {
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
}
