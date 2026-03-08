import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { CreateTopicCommand } from './create-topic.command';

@CommandHandler(CreateTopicCommand)
export class CreateTopicHandler implements ICommandHandler<CreateTopicCommand> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(command: CreateTopicCommand): Promise<TopicEntity> {
    const em = this.orm.em;

    // Check count limit (max 50)
    const topicCount = await em.count(TopicEntity, {
      tenantId: command.tenantId,
      userId: command.userId,
    });

    if (topicCount >= 50) {
      throw new BadRequestException(
        'User has reached the maximum limit of 50 topics.',
      );
    }

    const topic = new TopicEntity(
      command.tenantId,
      command.userId,
      command.name,
      command.description,
    );

    await em.persistAndFlush(topic);

    return topic;
  }
}
