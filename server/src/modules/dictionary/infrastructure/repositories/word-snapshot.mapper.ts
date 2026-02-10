import { WordExampleVO } from '../../domain/value-objects/word-example.vo';
import { WordPronunciationVO } from '../../domain/value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../../domain/value-objects/word-sense.vo';
import { WordSnapshot } from '../../domain/value-objects/word-snapshot.vo';
import { WordOrmEntity } from '../persistence/word.orm-entity';

export class WordSnapshotMapper {
  static toDomain(entity: WordOrmEntity): WordSnapshot {
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
        partOfSpeech: s.partOfSpeech,
        definition: s.definition,
        shortDefinition: s.shortDefinition,
        cefrLevel: s.cefrLevel,
        synonyms: s.synonyms || [],
        antonyms: s.antonyms || [],
        definitionVi: s.definitionVi,
        examples: examples,
      });
    });

    return new WordSnapshot({
      text: entity.text,
      normalizedText: entity.normalizedText,
      language: entity.language,
      source: entity.source as 'internal' | 'azvocab',
      rank: entity.rank,
      frequency: entity.frequency,
      pronunciations: pronunciations,
      senses: senses,
    });
  }
}
