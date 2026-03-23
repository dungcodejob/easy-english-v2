import { EntityManager } from '@mikro-orm/postgresql';
import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  InjectFlashcardRepository,
  type IFlashcardRepository,
} from '../../../domain/repositories/flashcard.repository.interface';
import { FlashcardMapper } from '../../../infrastructure/mappers/flashcard.mapper';
import { FlashcardSource } from '../../../domain/value-objects/flashcard-source.vo';
import { FlashcardResponseDto } from '../../../dto/responses/flashcard.response.dto';
import { CreateFlashcardCommand } from '../create-flashcard.command';
import { Flashcard } from '../../../domain/entities/flashcard.aggregate';

/**
 * Create Flashcard Command Handler
 *
 * Business logic layer - handles the create flashcard use case.
 * Creates flashcard aggregate and persists via repository.
 */
@CommandHandler(CreateFlashcardCommand)
export class CreateFlashcardHandler
  implements ICommandHandler<CreateFlashcardCommand, FlashcardResponseDto>
{
  private readonly logger = new Logger(CreateFlashcardHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    private readonly flashcardMapper: FlashcardMapper,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: CreateFlashcardCommand,
  ): Promise<FlashcardResponseDto> {
    // Create flashcard aggregate (domain logic)
    const flashcard = Flashcard.create({
      tenantId: command.tenantId,
      userId: command.userId,
      front: command.front,
      back: command.back,
      source: FlashcardSource.from(command.source),
      hint: command.hint,
      notes: command.notes,
      wordSenseId: command.wordSenseId,
    });

    // Persist via repository (no flush - handled by unit of work)
    await this.flashcardRepo.persist(flashcard);
    await this.em.flush();

    // Publish domain events
    flashcard.publishEvents(this.logger, this.eventBus);

    return this.flashcardMapper.toResponse(flashcard) as FlashcardResponseDto;
  }
}
