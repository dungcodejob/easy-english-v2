import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Tenant } from '../../domain/entities/tenant.entity';
import { ITenantRepository } from '../../domain/repositories/tenant.repository.interface';
import { TenantMikroEntity } from '../persistence/tenant.mikro-entity';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantMikroEntity)
    private readonly repo: EntityRepository<TenantMikroEntity>,
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    const entity = await this.repo.findOne({ id });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const entity = await this.repo.findOne({ slug });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  private toDomain(entity: TenantMikroEntity): Tenant {
    return new Tenant({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      createdAt: entity.createdAt,
    });
  }
}
