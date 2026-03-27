import { ICommand } from '@nestjs/cqrs';

export class StudySessionReviewCommand implements ICommand {
  constructor(
    public readonly sessionId: string,
    public readonly wordSenseId: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly rating: 1 | 2 | 3 | 4,
    public readonly reviewDurationMs: number,
  ) {}
}
