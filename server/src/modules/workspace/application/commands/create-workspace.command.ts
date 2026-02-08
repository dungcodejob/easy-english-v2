import { Command, CommandProps } from '@core/ddd';
import { CreateWorkspaceRequestDto } from '../../dto/requests/create-workspace.request.dto';

export class CreateWorkspaceCommand extends Command {
  public readonly tenantId: string;
  public readonly userId: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly type: CreateWorkspaceRequestDto['type'];
  public readonly language: CreateWorkspaceRequestDto['language'];
  public readonly learningGoal: CreateWorkspaceRequestDto['learningGoal'];
  public readonly level: CreateWorkspaceRequestDto['level'];
  public readonly dailyTarget: CreateWorkspaceRequestDto['dailyTarget'];
  public readonly studyReminder: CreateWorkspaceRequestDto['studyReminder'];
  public readonly defaultLearningMode: CreateWorkspaceRequestDto['defaultLearningMode'];

  constructor(
    props: CommandProps<
      CreateWorkspaceRequestDto & { tenantId: string; userId: string }
    >,
  ) {
    super(props);
    this.tenantId = props.tenantId;
    this.userId = props.userId;
    this.name = props.name!;
    this.description = props.description;
    this.type = props.type!;
    this.language = props.language!;
    this.learningGoal = props.learningGoal!;
    this.level = props.level!;
    this.dailyTarget = props.dailyTarget!;
    this.studyReminder = props.studyReminder!;
    this.defaultLearningMode = props.defaultLearningMode!;
  }
}
