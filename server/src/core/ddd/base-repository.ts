import { EntityNotFoundException } from '@core/exceptions';
import { EntityManager, EntityName, FilterQuery } from '@mikro-orm/core';

export abstract class BaseRepository {
  constructor(protected readonly em: EntityManager) {}

  // 🔹 Persist only (NO flush)
  protected persistEntity(entity: object): void {
    this.em.persist(entity);
  }

  // 🔹 Remove only
  protected removeEntity(entity: object): void {
    this.em.remove(entity);
  }

  // 🔹 Native delete (efficient)
  protected async deleteWhere<T extends object>(
    entity: EntityName<T>,
    where: FilterQuery<T>,
  ): Promise<boolean> {
    const affected = await this.em.nativeDelete(entity, where);
    return affected > 0;
  }

  // 🔹 Find one or null
  protected async findOne<T extends object>(
    entity: EntityName<T>,
    where: FilterQuery<T>,
  ): Promise<T | null> {
    return this.em.findOne(entity, where);
  }

  // 🔹 Find one or throw
  protected async findOneOrFail<T extends object>(
    entity: EntityName<T>,
    where: FilterQuery<T>,
    error?: Error,
  ): Promise<T> {
    const result = await this.em.findOne(entity, where);
    if (!result) throw error ?? new EntityNotFoundException('Entity not found');
    return result;
  }

  // 🔥 Multi-tenant helper (rất quan trọng)
  protected withTenant<T extends object>(
    where: T,
    tenantId: string,
  ): T & { tenantId: string } {
    return {
      ...where,
      tenantId,
    };
  }
}
