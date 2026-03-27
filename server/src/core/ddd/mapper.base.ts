import { type Entity } from './entity.base';

export interface Mapper<
  DomainEntity extends Entity,
  DbRecord,
  Response = object,
> {
  toPersistence(entity: DomainEntity): DbRecord;
  toDomain(record: object): DomainEntity;
  toResponse(entity: DomainEntity): Response;
}
