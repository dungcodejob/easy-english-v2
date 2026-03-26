import { IQuery } from '@nestjs/cqrs';

export class GetTopicCardsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly topicId: string,
  ) {}
}
