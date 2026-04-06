import { type IQuery } from '@nestjs/cqrs';

export class GetStudyStatsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
