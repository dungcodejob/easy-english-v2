import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Word } from '../../domain/entities/word.aggregate';
import { IWordReadRepository } from '../../domain/repositories/word-read.repository.interface';
import { WordOrmEntity } from '../persistence/word.orm-entity';
import { WordSnapshotMapper } from './word-snapshot.mapper';

@Injectable()
export class WordReadRepository implements IWordReadRepository {
  constructor(
    @InjectRepository(WordOrmEntity)
    private readonly repo: EntityRepository<WordOrmEntity>, // Using generic EntityRepository
  ) {}

  async findByWord(normalizedWord: string, tenantId: string): Promise<Word[]> {
    const words = await this.repo.findAll({
      where: {
        normalizedText: normalizedWord,
        tenantId,
      },
      populate: ['senses', 'senses.examples', 'pronunciations'],
    });

    if (!words) {
      return [];
    }

    return words.map((wordOrm) => {
      const snapshot = WordSnapshotMapper.toDomain(wordOrm);
      return Word.reconstitute({
        id: wordOrm.id,
        snapshot,
        source: snapshot.source,
        version: 1, // Defaulting as version control is not in the entity yet
        createdAt: wordOrm.createdAt,
        updatedAt: wordOrm.updatedAt,
      });
    });
  }
}
