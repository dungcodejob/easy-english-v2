import { ValueObject } from '@core/ddd';
import { WordExampleVO } from './word-example.vo';

export interface WordSenseProps {
  partOfSpeech: string;
  definition: string;
  shortDefinition: string | null;
  cefrLevel: string | null;
  examples: WordExampleVO[];
  synonyms: string[];
  antonyms: string[];
  definitionVi: string | null;
}

export class WordSenseVO extends ValueObject<WordSenseProps> {
  get partOfSpeech(): string {
    return this.props.partOfSpeech;
  }

  get definition(): string {
    return this.props.definition;
  }

  get shortDefinition(): string | null {
    return this.props.shortDefinition;
  }

  get cefrLevel(): string | null {
    return this.props.cefrLevel;
  }

  get examples(): WordExampleVO[] {
    return this.props.examples;
  }

  get synonyms(): string[] {
    return this.props.synonyms;
  }

  get antonyms(): string[] {
    return this.props.antonyms;
  }

  get definitionVi(): string | null {
    return this.props.definitionVi;
  }
}
