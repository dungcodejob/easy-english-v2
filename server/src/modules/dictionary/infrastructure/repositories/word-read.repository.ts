import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { IWordReadRepository } from '../../domain/repositories/word-read.repository.interface';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';
import { WordOrmEntity } from '../persistence/word.orm-entity';
import { WordSnapshotMapper } from './word-snapshot.mapper';

@Injectable()
export class WordReadRepository implements IWordReadRepository {
  constructor(
    @InjectRepository(WordOrmEntity)
    private readonly repo: EntityRepository<WordOrmEntity>, // Using generic EntityRepository
  ) {}

  async findByWord(
    normalizedWord: string,
    tenantId: string,
  ): Promise<WordSnapshot[]> {
    const word = await this.repo.findAll({
      where: {
        normalizedText: normalizedWord,
        tenantId,
      },
      populate: ['senses', 'senses.examples', 'pronunciations'],
    });

    if (!word) {
      return [];
    }

    return word.map((word) => WordSnapshotMapper.toDomain(word));
  }
}
