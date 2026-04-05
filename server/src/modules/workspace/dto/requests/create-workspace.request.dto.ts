import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  Language,
  LearningGoal,
  LearningMode,
  Level,
  WorkspaceType,
} from '../../domain/enums/workspace-enums';

export class CreateWorkspaceRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsEnum(WorkspaceType)
  @IsNotEmpty()
  readonly type!: WorkspaceType;

  @IsEnum(Language)
  @IsNotEmpty()
  readonly language!: Language;

  @IsEnum(LearningGoal)
  @IsNotEmpty()
  readonly learningGoal!: LearningGoal;

  @IsEnum(Level)
  @IsNotEmpty()
  readonly level!: Level;

  @IsNumber()
  @IsNotEmpty()
  readonly dailyTarget!: number;

  @IsBoolean()
  @IsNotEmpty()
  readonly studyReminder!: boolean;

  @IsEnum(LearningMode)
  @IsNotEmpty()
  readonly defaultLearningMode!: LearningMode;
}
