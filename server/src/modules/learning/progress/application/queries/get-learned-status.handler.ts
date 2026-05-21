import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  type ILearningReadRepository,
  InjectLearningReadRepository,
} from '../repositories/learning-read.repository.interface';
import { GetLearnedStatusQuery } from './get-learned-status.query';

@QueryHandler(GetLearnedStatusQuery)
export class GetLearnedStatusHandler implements IQueryHandler<GetLearnedStatusQuery> {
  constructor(
    @InjectLearningReadRepository()
    private readonly learningRepo: ILearningReadRepository,
  ) {}

  async execute(query: GetLearnedStatusQuery): Promise<string[]> {
    return this.learningRepo.checkLearnedStatus(query.userId, query.senseIds);
  }
}
