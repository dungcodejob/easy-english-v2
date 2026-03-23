import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { type IFlashcardRepository } from '../../../domain/repositories/flashcard.repository.interface';
import { InjectFlashcardRepository } from '../../../domain/repositories/flashcard.repository.interface';
import { UpdateFlashcardCommand } from '../update-flashcard.command';
import { FlashcardMapper } from '../../../infrastructure/mappers/flashcard.mapper';
import { FlashcardResponseDto } from '../../../dto/responses/flashcard.response.dto';

@CommandHandler(UpdateFlashcardCommand)
export class UpdateFlashcardHandler implements ICommandHandler<UpdateFlashcardCommand, FlashcardResponseDto | null> {
  private readonly logger = new Logger(UpdateFlashcardHandler.name);

  constructor(
    private readonly em: EntityManager,
    @InjectFlashcardRepository()
    private readonly flashcardRepo: IFlashcardRepository,
    private readonly flashcardMapper: FlashcardMapper,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateFlashcardCommand): Promise<FlashcardResponseDto | null> {
    const flashcard = await this.flashcardRepo.findById(command.id);
    if (!flashcard || flashcard.userId !== command.userId || flashcard.tenantId !== command.tenantId) {
      throw new NotFoundException('Flashcard not found');
    }

    flashcard.updateContent({
      front: command.front,
      back: command.back,
      hint: command.hint,
      notes: command.notes,
    });

    await this.flashcardRepo.persist(flashcard);
    await this.em.flush();
    flashcard.publishEvents(this.logger, this.eventBus);

    return this.flashcardMapper.toResponse(flashcard) as FlashcardResponseDto;
  }
}
