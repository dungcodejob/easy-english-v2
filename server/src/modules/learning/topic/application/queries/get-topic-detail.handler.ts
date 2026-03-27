import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetTopicDetailQuery } from './get-topic-detail.query';
import {
  InjectTopicRepository,
  type ITopicRepository,
} from '../../domain/repositories/topic.repository.interface';
import { TopicDto } from '../../dto/responses/topic.dto';
import { TopicMapper } from '../../infrastructure/mappers/topic.mapper';

/**
 * Get Topic Detail Query Handler
 *
 * Read layer - handles retrieving a single topic by ID.
 * Uses repository interface for data access.
 */
@QueryHandler(GetTopicDetailQuery)
export class GetTopicDetailHandler implements IQueryHandler<
  GetTopicDetailQuery,
  TopicDto
> {
  constructor(
    @InjectTopicRepository()
    private readonly repo: ITopicRepository,
    private readonly mapper: TopicMapper,
  ) {}

  async execute(query: GetTopicDetailQuery): Promise<TopicDto> {
    const { tenantId, userId, id } = query;

    const topic = await this.repo.findById(id, tenantId, userId);

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return this.mapper.toResponse(topic) as TopicDto;
  }
}
