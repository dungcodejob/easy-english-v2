import { WordExampleVO } from '../../domain/value-objects/word-example.vo';
import { WordPronunciationVO } from '../../domain/value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../../domain/value-objects/word-sense.vo';
import { WordOrmEntity } from '../persistence/word.orm-entity';

import { Word } from '../../domain/entities/word.aggregate';
import { CefrLevel } from '../../domain/value-objects/cefr-level.vo';
import { DataSource } from '../../domain/value-objects/data-source.vo';
import { Language } from '../../domain/value-objects/language.vo';
import { PartOfSpeech } from '../../domain/value-objects/part-of-speech.vo';
import { WordText } from '../../domain/value-objects/word-text.vo';

export class WordMapper {
  static toDomain(entity: WordOrmEntity): Word {
    const pronunciations = entity.pronunciations.getItems().map(
      (p) =>
        new WordPronunciationVO({
          ipa: p.ipa,
          audioUrl: p.audioUrl,
          region: p.region,
        }),
    );

    const sortedSenses = entity.senses
      .getItems()
      .sort((a, b) => a.order - b.order);

    const senses = sortedSenses.map((s) => {
      const examples = s.examples
        .getItems()
        .sort((a, b) => a.order - b.order)
        .map(
          (e) =>
            new WordExampleVO({
              text: e.text,
              translationVi: e.translationVi,
              order: e.order,
            }),
        );

      return new WordSenseVO({
        partOfSpeech: PartOfSpeech.from(s.partOfSpeech),
        definition: s.definition,
        shortDefinition: s.shortDefinition,
        cefrLevel: s.cefrLevel ? CefrLevel.from(s.cefrLevel) : null,
        synonyms: s.synonyms || [],
        antonyms: s.antonyms || [],
        definitionVi: s.definitionVi,
        idioms: s.idioms || [],
        phrases: s.phrases || [], // Map generic phrases
        // verbPhrases not in entity
        // collocations type mismatch (string[] vs object), skip for now or future migration
        images: s.images || [],
        examples: examples,
      });
    });

    const wordProps = {
      text: WordText.create(entity.text),
      normalizedText: WordText.create(entity.normalizedText),
      language: Language.from(entity.language),
      source: DataSource.from(entity.source),
      rank: entity.rank,
      frequency: entity.frequency,
      pronunciations: pronunciations,
      senses: senses,
      inflects: (entity.inflects as Record<string, string[]>) || undefined,
      // wordFamily mismatch (string vs object), skip
    };

    return Word.createFromProvider({
      wordProps,
    });
  }
}
