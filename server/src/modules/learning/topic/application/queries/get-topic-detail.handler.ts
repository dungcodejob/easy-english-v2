import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TopicDto } from '../../dto/responses/topic.dto';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { GetTopicDetailQuery } from './get-topic-detail.query';

@QueryHandler(GetTopicDetailQuery)
export class GetTopicDetailHandler implements IQueryHandler<GetTopicDetailQuery> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(query: GetTopicDetailQuery): Promise<TopicDto> {
    const em = this.orm.em;
    const { tenantId, userId, id } = query;

    const topic = await em.findOne(TopicEntity, {
      id,
      tenantId,
      userId,
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return {
      id: topic.id,
      name: topic.name,
      description: topic.description,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  }
}
