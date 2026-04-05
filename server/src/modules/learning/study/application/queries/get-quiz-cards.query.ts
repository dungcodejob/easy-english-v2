import { type IQuery } from '@nestjs/cqrs';

export class GetQuizCardsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly limit = 20,
  ) {}
}
