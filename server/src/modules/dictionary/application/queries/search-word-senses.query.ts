import { type IQuery } from '@nestjs/cqrs';

export class SearchWordSensesQuery implements IQuery {
  constructor(
    public readonly query: string,
    public readonly top = 20,
    public readonly skip = 0,
    public readonly userId?: string,
  ) {}
}
