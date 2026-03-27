import { type ICommand } from '@nestjs/cqrs';

export class ReviewWordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly wordSenseId: string,
    public readonly rating: 1 | 2 | 3 | 4,
    public readonly reviewDurationMs: number,
    public readonly sessionId?: string,
  ) {}
}
