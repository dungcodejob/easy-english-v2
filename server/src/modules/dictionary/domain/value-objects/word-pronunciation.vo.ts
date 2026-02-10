import { ValueObject } from '@core/ddd';

export interface WordPronunciationProps {
  ipa: string;
  audioUrl: string | null;
  region: string;
}

export class WordPronunciationVO extends ValueObject<WordPronunciationProps> {
  get ipa(): string {
    return this.props.ipa;
  }

  get audioUrl(): string | null {
    return this.props.audioUrl;
  }

  get region(): string {
    return this.props.region;
  }
}
