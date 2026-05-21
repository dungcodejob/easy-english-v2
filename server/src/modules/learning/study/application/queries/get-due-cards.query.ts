import { type IQuery } from '@nestjs/cqrs';

export type DueCardSource = 'dictionary' | 'flashcard' | 'all';

export class GetDueCardsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    /** Card source filter: 'dictionary' (default), 'flashcard', or 'all' */
    public readonly source: DueCardSource = 'dictionary',
  ) {}
}
