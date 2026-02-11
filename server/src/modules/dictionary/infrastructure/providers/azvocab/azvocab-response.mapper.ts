import { WordExampleVO } from '../../../domain/value-objects/word-example.vo';
import { WordPronunciationVO } from '../../../domain/value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../../../domain/value-objects/word-sense.vo';
import { WordSnapshot } from '../../../domain/value-objects/word-snapshot.vo';

// --- AzVocab DTOs ---

export interface AzVocabSearchResponseDto {
  id: string;
  pos: string;
  defs: DefinitionDto[];
  family?: WordFamilyDto;
  idioms?: string[];
  vocab: string;
  pron_uk?: string; // IPA UK
  pron_us?: string; // IPA US
  uk?: string; // Audio URL UK
  us?: string; // Audio URL US
  inflects?: Record<string, string[]>;
  rank?: number;
  freq?: number;
}

export interface DefinitionDto {
  id: string;
  vi: string;
  def: string;
  sets?: SetDto[];
  level?: string;
  images?: string[];
  samples?: SampleDto[];
  antonyms?: string[];
  synonyms?: string[];
  updateBy?: string;
  lastUpdate?: number;
  entryId: string;
  vocab: string;
  pos: string;
  uk?: string;
  us?: string;
  pron_uk?: string;
  pron_us?: string;
  idioms?: string[];
  verb_phrases?: string[];
  phrases?: string[];
  family?: WordFamilyDto;
  inflects?: Record<string, string[]>;
  rank?: number;
  freq?: number;
  colloc?: CollocationDto;
}

export interface SetDto {
  id: string;
  categoryId: string;
  collectionId: string;
}

export interface SampleDto {
  id: string;
  text: string;
  sets?: any[];
}

export interface WordFamilyDto {
  n?: string[];
  adj?: string[];
  adv?: string[];
  v?: string[];
  head: string;
}

export interface CollocationDto {
  pre?: {
    v?: string[];
    adv?: string[];
  };
  suf?: {
    prep?: string[];
  };
}

// --- Mapper ---

export class AzVocabResponseMapper {
  static toDomain(response: AzVocabSearchResponseDto): WordSnapshot {
    const pronunciations: WordPronunciationVO[] = [];

    // UK Pronunciation
    if (response.pron_uk || response.uk) {
      pronunciations.push(
        new WordPronunciationVO({
          ipa: response.pron_uk || '',
          audioUrl: response.uk || null,
          region: 'UK',
        }),
      );
    }

    // US Pronunciation
    if (response.pron_us || response.us) {
      pronunciations.push(
        new WordPronunciationVO({
          ipa: response.pron_us || '',
          audioUrl: response.us || null,
          region: 'US',
        }),
      );
    }

    const senses: WordSenseVO[] = [];

    if (response.defs) {
      for (const def of response.defs) {
        const examples: WordExampleVO[] = [];
        if (def.samples) {
          for (const sample of def.samples) {
            examples.push(
              new WordExampleVO({
                text: sample.text,
                translationVi: null,
                order: 1, // Default order
              }),
            );
          }
        }

        senses.push(
          new WordSenseVO({
            partOfSpeech: def.pos || response.pos, // Fallback to root pos if missing
            definition: def.def,
            shortDefinition: null,
            cefrLevel: def.level || null,
            examples,
            synonyms: def.synonyms || [],
            antonyms: def.antonyms || [],
            definitionVi: def.vi || null,
            collocations: def.colloc,
            idioms: def.idioms || [],
            phrases: def.phrases || [],
            verbPhrases: def.verb_phrases || [],
            images: def.images || [],
          }),
        );
      }
    }

    // Add root idioms if not present in senses?
    // The spec/DTOs show idioms in both root search response AND definition.
    // Usually root idioms are for the word itself across senses, but WordSnapshot VOs structure puts idioms in senses.
    // For now we map definition-level idioms.
    // If response.idioms exists and senses is empty, we might lose data, but WordSenseVO is structured around definitions.
    // Ideally idioms should be attached to a default 'general' sense if no definitions exist?
    // But let's stick to mapping definitions provided.

    return new WordSnapshot({
      text: response.vocab,
      normalizedText: response.vocab.toLowerCase(),
      language: 'en',
      source: 'azvocab',
      rank: response.rank || null,
      frequency: response.freq || null,
      pronunciations,
      senses,
      inflects: response.inflects,
      wordFamily: response.family,
    });
  }
}
