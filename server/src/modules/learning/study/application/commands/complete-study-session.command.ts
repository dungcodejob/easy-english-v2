import { type ICommand } from '@nestjs/cqrs';

export class CompleteStudySessionCommand implements ICommand {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
