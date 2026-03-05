import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { Word } from '../../domain/entities/word.aggregate';
import { IWordWriteRepository } from '../../domain/repositories/word-write.repository.interface';
import { WordExampleOrmEntity } from '../persistence/word-example.orm-entity';
import { WordPronunciationOrmEntity } from '../persistence/word-pronunciation.orm-entity';
import { WordSenseOrmEntity } from '../persistence/word-sense.orm-entity';
import { WordOrmEntity } from '../persistence/word.orm-entity';

@Injectable()
export class WordWriteRepository implements IWordWriteRepository {
  private readonly logger = new Logger(WordWriteRepository.name);

  constructor(private readonly em: EntityManager) {}

  async save(word: Word): Promise<void> {
    await this.em.transactional(async (em) => {
      // 1. Check if word exists
      let wordEntity: WordOrmEntity | null = await em.findOne(
        WordOrmEntity,
        // { id: word.id, tenantId },
        { id: word.id },
        { populate: ['senses', 'senses.examples', 'pronunciations'] },
      );

      // 2. Either update or create
      if (wordEntity) {
        // Clear collections so we can replace them cleanly
        wordEntity.senses.removeAll();
        wordEntity.pronunciations.removeAll();
        // The previously associated senses/pronunciations will be orphaned, so we might need orphanRemoval: true in the entity
        // Or we drop them explicitly to ensure we don't leak rows:
        // Actually, MikroORM will figure out the diff if we use `em.assign` or set the collections anew,
        // but to be safe we can just clear and add.
      } else {
        wordEntity = new WordOrmEntity();
        wordEntity.id = word.id;
        // wordEntity.tenantId = tenantId;
        wordEntity.normalizedText = word.normalizedText.value;
        em.persist(wordEntity);
      }

      // 3. Assign flat properties
      wordEntity.text = word.text.value;
      wordEntity.language = word.language.value;
      wordEntity.source = word.source.value;
      wordEntity.rank = word.rank;
      wordEntity.frequency = word.frequency;
      wordEntity.inflects = word.inflects;
      // wordEntity.wordFamily mapping if necessary

      // 4. Map and assign pronunciations
      word.pronunciations.forEach((p) => {
        const pronEntity = new WordPronunciationOrmEntity();
        pronEntity.ipa = p.ipa;
        pronEntity.audioUrl = p.audioUrl;
        pronEntity.region = p.region;
        wordEntity.pronunciations.add(pronEntity);
      });

      // 5. Map and assign senses and examples
      word.senses.forEach((s, senseIndex) => {
        const senseEntity = new WordSenseOrmEntity();
        senseEntity.partOfSpeech = s.partOfSpeech.value;
        senseEntity.definition = s.definition;
        senseEntity.shortDefinition = s.shortDefinition;
        senseEntity.cefrLevel = s.cefrLevel?.value || null;
        senseEntity.synonyms = s.synonyms;
        senseEntity.antonyms = s.antonyms;
        senseEntity.definitionVi = s.definitionVi;
        // senseEntity.collocations might mismatch structure, map if needed
        senseEntity.idioms = s.idioms || null;
        senseEntity.phrases = s.phrases || null;
        senseEntity.images = s.images || null;
        senseEntity.order = senseIndex;

        s.examples.forEach((e) => {
          const exampleEntity = new WordExampleOrmEntity();
          exampleEntity.text = e.text;
          exampleEntity.translationVi = e.translationVi;
          exampleEntity.order = e.order;
          senseEntity.examples.add(exampleEntity);
        });

        wordEntity.senses.add(senseEntity);
      });

      // Bắt buộc Unit of Work theo dõi và cascade persist các entity mới
      em.persist(wordEntity);
    });

    this.logger.debug(`Saved word '${word.normalizedText.value}' to DB.`);
  }
}
