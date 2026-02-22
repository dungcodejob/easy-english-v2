import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { IWordWriteRepository } from '../../domain/repositories/word-write.repository.interface';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';
import { WordExampleOrmEntity } from '../persistence/word-example.orm-entity';
import { WordPronunciationOrmEntity } from '../persistence/word-pronunciation.orm-entity';
import { WordSenseOrmEntity } from '../persistence/word-sense.orm-entity';
import { WordOrmEntity } from '../persistence/word.orm-entity';

@Injectable()
export class WordWriteRepository implements IWordWriteRepository {
  private readonly logger = new Logger(WordWriteRepository.name);

  constructor(private readonly em: EntityManager) {}

  async save(snapshot: WordSnapshot, tenantId: string): Promise<void> {
    await this.em.transactional(async (em) => {
      // 1. Check if word exists
      let wordEntity: WordOrmEntity | null = await em.findOne(
        WordOrmEntity,
        { normalizedText: snapshot.normalizedText, tenantId },
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
        wordEntity.tenantId = tenantId;
        wordEntity.normalizedText = snapshot.normalizedText;
        em.persist(wordEntity);
      }

      // 3. Assign flat properties
      wordEntity.text = snapshot.text;
      wordEntity.language = snapshot.language;
      wordEntity.source = snapshot.source;
      wordEntity.rank = snapshot.rank;
      wordEntity.frequency = snapshot.frequency;
      wordEntity.inflects = snapshot.inflects;
      // wordEntity.wordFamily mapping if necessary

      // 4. Map and assign pronunciations
      snapshot.pronunciations.forEach((p) => {
        const pronEntity = new WordPronunciationOrmEntity();
        pronEntity.ipa = p.ipa;
        pronEntity.audioUrl = p.audioUrl;
        pronEntity.region = p.region;
        wordEntity.pronunciations.add(pronEntity);
      });

      // 5. Map and assign senses and examples
      snapshot.senses.forEach((s, senseIndex) => {
        const senseEntity = new WordSenseOrmEntity();
        senseEntity.partOfSpeech = s.partOfSpeech;
        senseEntity.definition = s.definition;
        senseEntity.shortDefinition = s.shortDefinition;
        senseEntity.cefrLevel = s.cefrLevel;
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
    });

    this.logger.debug(
      `Saved word snapshot '${snapshot.normalizedText}' to DB.`,
    );
  }
}
