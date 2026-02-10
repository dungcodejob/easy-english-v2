import { IQuery } from '@nestjs/cqrs';

export class LookupWordQuery implements IQuery {
  constructor(
    public readonly word: string,
    public readonly tenantId: string,
    public readonly userId: string,
  ) {}
}
