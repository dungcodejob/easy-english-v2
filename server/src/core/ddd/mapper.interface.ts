import { Entity } from './entity.base';

export interface Mapper<DomainEntity extends Entity, DbRecord, Response = any> {
  toPersistence(entity: DomainEntity): DbRecord;
  toDomain(record: any): DomainEntity;
  toResponse(entity: DomainEntity): Response;
}
