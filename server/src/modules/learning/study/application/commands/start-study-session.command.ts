import { type ICommand } from '@nestjs/cqrs';

export class StartStudySessionCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly scope: 'DUE' | 'TOPIC',
    public readonly topicId?: string,
  ) {}
}
