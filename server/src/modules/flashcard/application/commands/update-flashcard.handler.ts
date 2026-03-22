import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { UpdateFlashcardCommand } from './update-flashcard.command';
import { FlashcardResponseDto } from '../../dto/responses/flashcard.response.dto';

@CommandHandler(UpdateFlashcardCommand)
export class UpdateFlashcardHandler implements ICommandHandler<UpdateFlashcardCommand> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(command: UpdateFlashcardCommand): Promise<FlashcardResponseDto | null> {
    const flashcard = await this.flashcardRepo.findById(command.id);
    if (!flashcard || flashcard.userId !== command.userId) {
      return null;
    }

    flashcard.front = command.front;
    flashcard.back = command.back;
    flashcard.hint = command.hint;
    flashcard.notes = command.notes;

    const updated = await this.flashcardRepo.update(flashcard);

    return {
      id: updated.id,
      front: updated.front,
      back: updated.back,
      hint: updated.hint,
      notes: updated.notes,
      source: updated.source,
      wordSenseId: updated.wordSenseId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
