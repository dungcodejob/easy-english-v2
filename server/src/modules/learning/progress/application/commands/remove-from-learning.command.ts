import { type ICommand } from '@nestjs/cqrs';

export class RemoveFromLearningCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly wordSenseId: string,
  ) {}
}
