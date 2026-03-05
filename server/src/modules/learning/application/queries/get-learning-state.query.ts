import { IQuery } from '@nestjs/cqrs';

export class GetLearningStateQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly wordSenseId: string,
  ) {}
}
