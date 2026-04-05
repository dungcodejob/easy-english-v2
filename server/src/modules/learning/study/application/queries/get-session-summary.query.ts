import { type IQuery } from '@nestjs/cqrs';

export class GetSessionSummaryQuery implements IQuery {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
