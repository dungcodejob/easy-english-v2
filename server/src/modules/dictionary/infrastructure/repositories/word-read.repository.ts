import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Word } from '../../domain/entities/word.aggregate';
import {
  IWordReadRepository,
  WordSenseDetailReadModel,
  WordSenseSearchReadModel,
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
  ): Promise<{ data: WordSenseSearchReadModel[]; count: number }> {
    const qb = this.em
      .createQueryBuilder(WordSenseOrmEntity, 's')
      .leftJoinAndSelect('s.word', 'w')
      .where({ 'w.normalizedText': { $ilike: `%${query}%` } })
      .limit(top)
      .offset(skip);

    const [senses, count] = await qb.getResultAndCount();

    const data: WordSenseSearchReadModel[] = senses.map((s) => ({
      senseId: s.id,
      wordText: s.word.text,
      normalizedText: s.word.normalizedText,
      partOfSpeech: s.partOfSpeech,
      shortDefinition: s.shortDefinition,
      cefrLevel: s.cefrLevel || null,
    }));

    return { data, count };
  }

  async findSenseById(
    senseId: string,
  ): Promise<WordSenseDetailReadModel | null> {
    const sense = await this.em.findOne(
      WordSenseOrmEntity,
      { id: senseId },
      {
        populate: ['word', 'word.pronunciations', 'examples'],
      },
    );

    if (!sense) return null;

    return {
      senseId: sense.id,
      wordText: sense.word.text,
      normalizedText: sense.word.normalizedText,
      partOfSpeech: sense.partOfSpeech,
      definition: sense.definition,
      shortDefinition: sense.shortDefinition,
      cefrLevel: sense.cefrLevel || null,
      definitionVi: sense.definitionVi,
      examples: sense.examples
        .getItems()
        .sort((a, b) => a.order - b.order)
        .map((e) => ({
          text: e.text,
          translationVi: e.translationVi,
          order: e.order,
        })),
      synonyms: sense.synonyms || [],
      antonyms: sense.antonyms || [],
      idioms: sense.idioms || [],
      phrases: sense.phrases || [],
      collocations: sense.collocations,
      pronunciations:
        sense.word.pronunciations.getItems()?.map((p) => ({
          ipa: p.ipa,
          audioUrl: p.audioUrl,
          region: p.region,
        })) || [],
    };
  }
}
