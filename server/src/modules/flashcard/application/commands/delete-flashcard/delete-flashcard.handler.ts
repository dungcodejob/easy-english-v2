import { EntityManager } from '@mikro-orm/postgresql';
import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  InjectFlashcardRepository,
  type IFlashcardRepository,
} from '../../../domain/repositories/flashcard.repository.interface';
import { DeleteFlashcardCommand } from '../delete-flashcard.command';

@CommandHandler(DeleteFlashcardCommand)
export class DeleteFlashcardHandler implements ICommandHandler<
  DeleteFlashcardCommand,
  boolean
> {
  private readonly logger = new Logger(DeleteFlashcardHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteFlashcardCommand): Promise<boolean> {
    const flashcard = await this.flashcardRepo.findById(command.id);
    if (
      !flashcard ||
      flashcard.userId !== command.userId ||
      flashcard.tenantId !== command.tenantId
    ) {
      return false;
    }

    flashcard.markDeleted();
    await this.flashcardRepo.delete(
      command.id,
      command.userId,
      command.tenantId,
    );
    await this.em.flush();
    flashcard.publishEvents(this.logger, this.eventBus);

    return true;
  }
}
