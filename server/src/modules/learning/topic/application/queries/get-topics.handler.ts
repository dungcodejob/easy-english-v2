import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetTopicsQuery } from './get-topics.query';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from '../../domain/repositories/topic.repository.interface';
import { TopicDto } from '../../dto/responses/topic.dto';
import { TopicMapper } from '../../infrastructure/mappers/topic.mapper';

export interface PaginatedTopicsResponse {
  data: TopicDto[];
  count: number;
}

/**
 * Get Topics Query Handler
 *
 * Read layer - handles listing topics for a user with pagination.
 * Uses repository interface for data access.
 */
@QueryHandler(GetTopicsQuery)
export class GetTopicsHandler implements IQueryHandler<
  GetTopicsQuery,
  PaginatedTopicsResponse
> {
  constructor(
    @InjectTopicRepository()
    private readonly repo: ITopicRepository,
    private readonly mapper: TopicMapper,
  ) {}

  async execute(query: GetTopicsQuery): Promise<PaginatedTopicsResponse> {
    const { tenantId, userId, top, skip } = query;

    const { data, count } = await this.repo.findByUser(
      tenantId,
      userId,
      top,
      skip,
    );

    return {
      data: data.map((t) => this.mapper.toResponse(t) as TopicDto),
      count,
    };
  }
}
