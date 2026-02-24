import { ValueObject } from '@core/ddd';
import { ArgumentNotProvidedException } from '@core/exceptions';

export class DataSource extends ValueObject<{ value: string }> {
  static readonly INTERNAL = new DataSource({ value: 'internal' });
  static readonly AZVOCAB = new DataSource({ value: 'azvocab' });

  get value(): string {
    return this.props.value;
  }

  get isExternal(): boolean {
    return this.props.value !== 'internal';
  }

  static from(source: string): DataSource {
    if (!source) {
      throw new ArgumentNotProvidedException('Data source cannot be empty');
    }
    const cleanSource = source.trim().toLowerCase();

    if (cleanSource === 'internal') return DataSource.INTERNAL;
    if (cleanSource === 'azvocab') return DataSource.AZVOCAB;

    return new DataSource({ value: cleanSource });
  }
}
