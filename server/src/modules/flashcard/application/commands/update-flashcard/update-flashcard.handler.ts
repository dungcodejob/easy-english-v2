import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';

import { EntityManager } from '@mikro-orm/postgresql';

import {
  InjectFlashcardRepository,
  type IFlashcardRepository,
} from '../../../domain/repositories/flashcard.repository.interface';
import { FlashcardResponseDto } from '../../../dto/responses/flashcard.response.dto';
import { FlashcardMapper } from '../../../infrastructure/mappers/flashcard.mapper';
import { UpdateFlashcardCommand } from '../update-flashcard.command';

/**
 * Update Flashcard Command Handler
 *
 * Business logic layer - handles the update flashcard use case.
 * Validates ownership before updating (multi-tenant safety).
 */
@CommandHandler(UpdateFlashcardCommand)
export class UpdateFlashcardHandler implements ICommandHandler<
  UpdateFlashcardCommand,
  FlashcardResponseDto | null
> {
  private readonly logger = new Logger(UpdateFlashcardHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    private readonly flashcardMapper: FlashcardMapper,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: UpdateFlashcardCommand,
  ): Promise<FlashcardResponseDto | null> {
    // Find the flashcard
    const flashcard = await this.flashcardRepo.findById(command.id);

    // Validate ownership and tenant
    if (
      flashcard?.userId !== command.userId ||
      flashcard.tenantId !== command.tenantId
    ) {
      throw new NotFoundException('Flashcard not found');
    }

    // Update content (domain logic)
    flashcard.updateContent({
      front: command.front,
      back: command.back,
      hint: command.hint,
      notes: command.notes,
    });

    // Persist changes (no flush - handled by unit of work)
    await this.flashcardRepo.persist(flashcard);
    await this.em.flush();

    // Publish domain events
    flashcard.publishEvents(this.logger, this.eventBus);

    return this.flashcardMapper.toResponse(flashcard) as FlashcardResponseDto;
  }
}
