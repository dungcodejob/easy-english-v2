import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopicEntity } from '../../infrastructure/persistence/topic.orm-entity';
import { DeleteTopicCommand } from './delete-topic.command';

@CommandHandler(DeleteTopicCommand)
export class DeleteTopicHandler implements ICommandHandler<DeleteTopicCommand> {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async execute(command: DeleteTopicCommand): Promise<void> {
    const em = this.orm.em;

    const topic = await em.findOne(
      TopicEntity,
      {
        id: command.topicId,
        tenantId: command.tenantId,
        userId: command.userId,
      },
      { populate: ['words'] },
    );

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Cascade deletion is handled by MikroORM via cascade: [Cascade.ALL] and orphanRemoval: true
    // on the words collection in TopicEntity
    await em.removeAndFlush(topic);
  }
}
