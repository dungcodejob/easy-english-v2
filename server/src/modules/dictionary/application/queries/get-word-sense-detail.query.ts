import { IQuery } from '@nestjs/cqrs';

export class GetWordSenseDetailQuery implements IQuery {
  constructor(
    public readonly senseId: string,
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}
