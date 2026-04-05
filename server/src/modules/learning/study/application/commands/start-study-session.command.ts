import { type ICommand } from '@nestjs/cqrs';

import {
  type StudySessionScope,
  type StudySessionType,
} from '../../domain/entities/study-session.entity';

export class StartStudySessionCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly studyType: StudySessionType,
    public readonly scope: StudySessionScope,
    public readonly topicId?: string,
  ) {}
}
