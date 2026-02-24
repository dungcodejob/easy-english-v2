import { Injectable, Logger } from '@nestjs/common';
import { CefrLevel } from '../../../domain/value-objects/cefr-level.vo';
import { DataSource } from '../../../domain/value-objects/data-source.vo';
import { Language } from '../../../domain/value-objects/language.vo';
import { PartOfSpeech } from '../../../domain/value-objects/part-of-speech.vo';
import { WordExampleVO } from '../../../domain/value-objects/word-example.vo';
import { WordPronunciationVO } from '../../../domain/value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../../../domain/value-objects/word-sense.vo';
import { WordSnapshot } from '../../../domain/value-objects/word-snapshot.vo';
import { WordText } from '../../../domain/value-objects/word-text.vo';
import {
  AzVocabDefinitionResponseDto,
  AzVocabSearchResponseDto,
  DefinitionDto,
} from './azvocab.types';

@Injectable()
export class AzVocabAdapter {
  private readonly logger = new Logger(AzVocabAdapter.name);

  toDomain(
    searchResponses: AzVocabSearchResponseDto,
    definitions: AzVocabDefinitionResponseDto[],
  ): WordSnapshot {
    // 1. Base Metadata from Primary Search Result
    const primary = searchResponses;
    const pronunciations = this.mapPronunciations(primary);

    // 2. Aggregate Senses
    const senses: WordSenseVO[] = [];
    const processedDefIds = new Set<string>();

    // 2a. Map full definitions
    for (const defResponse of definitions) {
      if (defResponse?.pageProps?.def) {
        const def = defResponse.pageProps.def;
        senses.push(this.mapFullDefinitionToSense(def, primary.pos));
        processedDefIds.add(def.id);
      }
    }

    for (const partialDef of primary.defs) {
      if (!processedDefIds.has(partialDef.id)) {
        // Only map if partialDef has essential fields (id, def)
        if (partialDef.id && partialDef.def) {
          senses.push(
            this.mapPartialDefinitionToSense(partialDef, primary.pos),
          );
          processedDefIds.add(partialDef.id);
        }
      }
    }

    if (senses.length === 0) {
      this.logger.warn(`No senses found for word '${primary.vocab}'`);
    }

    return new WordSnapshot({
      text: WordText.create(primary.vocab),
      normalizedText: WordText.create(primary.vocab.toLowerCase()),
      language: Language.ENGLISH,
      source: DataSource.AZVOCAB,
      rank: primary.rank || null,
      frequency: primary.freq || null,
      pronunciations,
      senses,
      inflects: primary.inflects,
      wordFamily: primary.family,
    });
  }

  private mapPronunciations(
    primary: AzVocabSearchResponseDto,
  ): WordPronunciationVO[] {
    const prons: WordPronunciationVO[] = [];

    // primary or its fields could be missing partially, use safe checks
    if (!primary) return prons;

    if (primary.pron_uk || primary.uk) {
      prons.push(
        new WordPronunciationVO({
          ipa: primary.pron_uk || '',
          audioUrl: primary.uk || null,
          region: 'UK',
        }),
      );
    }

    if (primary.pron_us || primary.us) {
      prons.push(
        new WordPronunciationVO({
          ipa: primary.pron_us || '',
          audioUrl: primary.us || null,
          region: 'US',
        }),
      );
    }

    return prons;
  }

  private mapFullDefinitionToSense(
    def: DefinitionDto,
    fallbackPos: string,
  ): WordSenseVO {
    const examples: WordExampleVO[] = [];

    if (def.samples) {
      def.samples.forEach((sample, index) => {
        if (sample && sample.text) {
          examples.push(
            new WordExampleVO({
              text: sample.text,
              translationVi: null,
              order: index + 1,
            }),
          );
        }
      });
    }

    let cefrLevel: CefrLevel | null = null;
    if (def.level) {
      try {
        cefrLevel = CefrLevel.from(def.level);
      } catch {
        this.logger.warn(`Invalid CEFR level ${def.level} from provider`);
      }
    }

    return new WordSenseVO({
      partOfSpeech: PartOfSpeech.from(def.pos || fallbackPos || 'unknown'),
      definition: def.def || '',
      shortDefinition: null,
      cefrLevel,
      examples,
      synonyms: def.synonyms || [],
      antonyms: def.antonyms || [],
      definitionVi: def.vi || null,
      collocations: def.colloc, // Directly compatible structure
      idioms: def.idioms || [],
      phrases: def.phrases || [],
      verbPhrases: def.verb_phrases || [],
      images: def.images || [],
    });
  }

  private mapPartialDefinitionToSense(
    def: Pick<DefinitionDto, 'id' | 'def' | 'vi' | 'pos'>,
    fallbackPos: string,
  ): WordSenseVO {
    return new WordSenseVO({
      partOfSpeech: PartOfSpeech.from(def.pos || fallbackPos || 'unknown'),
      definition: def.def,
      shortDefinition: null,
      cefrLevel: null,
      examples: [],
      synonyms: [],
      antonyms: [],
      definitionVi: def.vi || null,
      collocations: undefined,
      idioms: [],
      phrases: [],
      verbPhrases: [],
      images: [],
    });
  }
}
