import { WordExampleVO } from '../../../domain/value-objects/word-example.vo';
import { WordPronunciationVO } from '../../../domain/value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../../../domain/value-objects/word-sense.vo';
import { WordSnapshot } from '../../../domain/value-objects/word-snapshot.vo';

export interface AzVocabResponse {
  word: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export class AzVocabResponseMapper {
  static toDomain(response: AzVocabResponse): WordSnapshot {
    const pronunciations = (response.phonetics || [])
      .filter((p) => p.text) // Must have IPA text
      .map((p) => {
        return new WordPronunciationVO({
          ipa: p.text!,
          audioUrl: p.audio || null,
          region: 'US', // Default region as AzVocab doesn't specify
        });
      });

    const senses: WordSenseVO[] = [];

    for (const meaning of response.meanings) {
      for (const def of meaning.definitions) {
        const examples: WordExampleVO[] = [];
        if (def.example) {
          examples.push(
            new WordExampleVO({
              text: def.example,
              translationVi: null,
              order: 1,
            }),
          );
        }

        senses.push(
          new WordSenseVO({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            shortDefinition: null,
            cefrLevel: null,
            examples,
            synonyms: [],
            antonyms: [],
            definitionVi: null,
          }),
        );
      }
    }

    return new WordSnapshot({
      text: response.word,
      normalizedText: response.word.toLowerCase(),
      language: 'en',
      source: 'azvocab',
      rank: null,
      frequency: null,
      pronunciations,
      senses,
    });
  }
}
