import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IFlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { DeleteFlashcardCommand } from './delete-flashcard.command';

@CommandHandler(DeleteFlashcardCommand)
export class DeleteFlashcardHandler implements ICommandHandler<DeleteFlashcardCommand> {
  constructor(private readonly flashcardRepo: IFlashcardRepository) {}

  async execute(command: DeleteFlashcardCommand): Promise<boolean> {
    const flashcard = await this.flashcardRepo.findById(command.id);
    if (!flashcard || flashcard.userId !== command.userId) {
      return false;
    }
    return this.flashcardRepo.delete(command.id);
  }
}
