import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TopicDto } from '../../dto/responses/topic.dto';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { GetTopicsQuery } from './get-topics.query';

export interface PaginatedTopicsResponse {
  data: TopicDto[];
  count: number;
}

@QueryHandler(GetTopicsQuery)
export class GetTopicsHandler implements IQueryHandler<GetTopicsQuery> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(query: GetTopicsQuery): Promise<PaginatedTopicsResponse> {
    const em = this.orm.em;
    const { tenantId, userId, top, skip } = query;

    const [topics, total] = await em.findAndCount(
      TopicEntity,
      { tenantId, userId },
      {
        limit: top,
        offset: skip,
        orderBy: { createdAt: 'DESC' },
      },
    );

    return {
      data: topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      })),
      count: total,
    };
  }
}
