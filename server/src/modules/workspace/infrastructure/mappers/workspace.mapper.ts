import { Mapper } from '@core/ddd/mapper.interface';
import { WorkspaceEntity } from '../../domain/entities/workspace.entity';
import { WorkspaceOrmEntity } from '../persistence/workspace.orm-entity';

export class WorkspaceMapper implements Mapper<
  WorkspaceEntity,
  WorkspaceOrmEntity
> {
  toDomain(ormEntity: WorkspaceOrmEntity): WorkspaceEntity {
    return WorkspaceEntity.rehydrate({
      id: ormEntity.id,
      tenantId: ormEntity.tenantId,
      userId: ormEntity.userId,
      name: ormEntity.name,
      description: ormEntity.description,
      type: ormEntity.type,
      language: ormEntity.language,
      learningGoal: ormEntity.learningGoal,
      level: ormEntity.level,
      dailyTarget: ormEntity.dailyTarget,
      studyReminder: ormEntity.studyReminder,
      defaultLearningMode: ormEntity.defaultLearningMode,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toPersistence(domainEntity: WorkspaceEntity): WorkspaceOrmEntity {
    const ormEntity = new WorkspaceOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.tenantId = domainEntity.tenantId;
    ormEntity.userId = domainEntity.userId;
    ormEntity.name = domainEntity.name;
    ormEntity.description = domainEntity.description;
    ormEntity.type = domainEntity.type;
    ormEntity.language = domainEntity.language;
    ormEntity.learningGoal = domainEntity.learningGoal;
    ormEntity.level = domainEntity.level;
    ormEntity.dailyTarget = domainEntity.dailyTarget;
    ormEntity.studyReminder = domainEntity.studyReminder;
    ormEntity.defaultLearningMode = domainEntity.defaultLearningMode;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }

  toResponse(entity: WorkspaceEntity): any {
    // Return a plain object or DTO
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      userId: entity.userId,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      language: entity.language,
      learningGoal: entity.learningGoal,
      level: entity.level,
      dailyTarget: entity.dailyTarget,
      studyReminder: entity.studyReminder,
      defaultLearningMode: entity.defaultLearningMode,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
