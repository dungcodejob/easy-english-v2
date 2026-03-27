import { type ICommand } from '@nestjs/cqrs';

export class AddToLearningCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly wordSenseId: string,
  ) {}
}
