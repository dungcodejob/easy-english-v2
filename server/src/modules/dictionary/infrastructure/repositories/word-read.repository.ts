import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { WordSenseEntity } from '../../domain/entities/word-sense.entity';
import { Word } from '../../domain/entities/word.aggregate';
import {
  IWordReadRepository,
  type WordSenseSearchItem,
} from '../../domain/repositories/word-read.repository.interface';
import { CefrLevel } from '../../domain/value-objects/cefr-level.vo';
import { PartOfSpeech } from '../../domain/value-objects/part-of-speech.vo';
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
  ): Promise<{ data: WordSenseSearchItem[]; count: number }> {
    const qb = this.em
      .createQueryBuilder(WordSenseOrmEntity, 's')
      .leftJoinAndSelect('s.word', 'w')
      .where({ 'w.normalizedText': { $ilike: `%${query}%` } })
      .limit(top)
      .offset(skip);

    const [senses, count] = await qb.getResultAndCount();

    const data: WordSenseSearchItem[] = senses.map((s) => ({
      sense: new WordSenseEntity({
        id: s.id,
        partOfSpeech: PartOfSpeech.from(s.partOfSpeech),
        definition: s.definition,
        shortDefinition: s.shortDefinition,
        cefrLevel: s.cefrLevel ? CefrLevel.from(s.cefrLevel) : null,
        examples: [], // Empty examples to save memory, detail api will fetch full
        synonyms: s.synonyms || [],
        antonyms: s.antonyms || [],
        definitionVi: s.definitionVi,
        idioms: s.idioms || [],
        phrases: s.phrases || [],
        images: s.images || [],
      }),
      wordText: s.word.text,
      normalizedText: s.word.normalizedText,
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
