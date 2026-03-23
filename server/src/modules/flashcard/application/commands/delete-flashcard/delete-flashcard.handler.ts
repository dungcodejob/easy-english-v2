import { EntityManager } from '@mikro-orm/postgresql';
import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  InjectFlashcardRepository,
  type IFlashcardRepository,
} from '../../../domain/repositories/flashcard.repository.interface';
import { DeleteFlashcardCommand } from '../delete-flashcard.command';

/**
 * Delete Flashcard Command Handler
 *
 * Business logic layer - handles the delete flashcard use case.
 * Validates ownership before deletion (multi-tenant safety).
 */
@CommandHandler(DeleteFlashcardCommand)
export class DeleteFlashcardHandler
  implements ICommandHandler<DeleteFlashcardCommand, boolean>
{
  private readonly logger = new Logger(DeleteFlashcardHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteFlashcardCommand): Promise<boolean> {
    // Find the flashcard first
    const flashcard = await this.flashcardRepo.findById(command.id);

    // Check ownership and tenant
    if (
      !flashcard ||
      flashcard.userId !== command.userId ||
      flashcard.tenantId !== command.tenantId
    ) {
      return false;
    }

    // Mark as deleted (domain logic)
    flashcard.markDeleted();

    // Delete with tenant scope for additional safety
    const deleted = await this.flashcardRepo.delete(
      command.id,
      command.userId,
      command.tenantId,
    );

    // Publish domain events
    flashcard.publishEvents(this.logger, this.eventBus);

    return deleted;
  }
}
