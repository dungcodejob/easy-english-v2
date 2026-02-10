import { ValueObject } from '@core/ddd';

export interface WordExampleProps {
  text: string;
  translationVi: string | null;
  order: number;
}

export class WordExampleVO extends ValueObject<WordExampleProps> {
  get text(): string {
    return this.props.text;
  }

  get translationVi(): string | null {
    return this.props.translationVi;
  }

  get order(): number {
    return this.props.order;
  }
}
