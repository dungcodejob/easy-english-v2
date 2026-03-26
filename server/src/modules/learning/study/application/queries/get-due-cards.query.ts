import { IQuery } from '@nestjs/cqrs';

export class GetDueCardsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
