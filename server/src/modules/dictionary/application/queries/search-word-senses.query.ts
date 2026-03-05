import { IQuery } from '@nestjs/cqrs';

export class SearchWordSensesQuery implements IQuery {
  constructor(
    public readonly query: string,
    public readonly top: number = 20,
    public readonly skip: number = 0,
  ) {}
}
