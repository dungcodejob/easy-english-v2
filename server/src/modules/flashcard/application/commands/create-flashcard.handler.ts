import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FlashcardOrmEntity } from '../../infrastructure/persistence/flashcard.orm-entity';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { CreateFlashcardCommand } from './create-flashcard.command';
import { FlashcardResponseDto } from '../../dto/responses/flashcard.response.dto';

@CommandHandler(CreateFlashcardCommand)
export class CreateFlashcardHandler implements ICommandHandler<CreateFlashcardCommand> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(command: CreateFlashcardCommand): Promise<FlashcardResponseDto> {
    const flashcard = new FlashcardOrmEntity(
      command.tenantId,
      command.userId,
      command.front,
      command.back,
      command.source,
      command.hint,
      command.notes,
      command.wordSenseId,
    );

    const created = await this.flashcardRepo.create(flashcard);

    return {
      id: created.id,
      front: created.front,
      back: created.back,
      hint: created.hint,
      notes: created.notes,
      source: created.source,
      wordSenseId: created.wordSenseId,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
