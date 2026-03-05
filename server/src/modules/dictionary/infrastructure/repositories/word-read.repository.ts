import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Word } from '../../domain/entities/word.aggregate';
import {
  IWordReadRepository,
  WordSenseSearchResult,
} from '../../domain/repositories/word-read.repository.interface';
import { WordSenseOrmEntity } from '../persistence/word-sense.orm-entity';
import { WordOrmEntity } from '../persistence/word.orm-entity';
import { WordMapper } from './word.mapper';

@Injectable()
export class WordReadRepository implements IWordReadRepository {
  constructor(
    @InjectRepository(WordOrmEntity)
    private readonly repo: EntityRepository<WordOrmEntity>,
    private readonly em: EntityManager,
  ) {}

  async findByWord(normalizedWord: string): Promise<Word[]> {
    const words = await this.repo.findAll({
      where: {
        normalizedText: normalizedWord,
      },
      populate: ['senses', 'senses.examples', 'pronunciations'],
    });

    if (!words) {
      return [];
    }

    return words.map((wordOrm) => {
      const wordProps = WordMapper.toDomain(wordOrm);
      return Word.rehydrate({
        id: wordOrm.id,
        wordProps,
        version: 1, // Defaulting as version control is not in the entity yet
        createdAt: wordOrm.createdAt,
        updatedAt: wordOrm.updatedAt,
      });
    });
  }

  async searchByPrefix(
    query: string,
    top: number,
    skip: number,
  ): Promise<{ data: WordSenseSearchResult[]; count: number }> {
    const qb = this.em
      .createQueryBuilder(WordSenseOrmEntity, 's')
      .leftJoinAndSelect('s.word', 'w')
      .where({ 'w.normalizedText': { $ilike: `${query}%` } })
      .limit(top)
      .offset(skip);

    const [senses, count] = await qb.getResultAndCount();

    const data: WordSenseSearchResult[] = senses.map((s) => ({
      senseId: s.id,
      wordText: s.word.text,
      normalizedText: s.word.normalizedText,
      partOfSpeech: s.partOfSpeech,
      shortDefinition: s.shortDefinition,
      cefrLevel: s.cefrLevel,
    }));

    return { data, count };
  }

  async findSenseById(senseId: string): Promise<any> {
    const sense = await this.em.findOne(
      WordSenseOrmEntity,
      { id: senseId },
      {
        populate: ['word', 'word.pronunciations', 'examples'],
      },
    );
    return sense;
  }
}
