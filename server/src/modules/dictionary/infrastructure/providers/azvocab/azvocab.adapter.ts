import { Injectable, Logger } from '@nestjs/common';
import { Word } from 'src/modules/dictionary/domain/entities/word.aggregate';
import { CefrLevel } from '../../../domain/value-objects/cefr-level.vo';
import { DataSource } from '../../../domain/value-objects/data-source.vo';
import { Language } from '../../../domain/value-objects/language.vo';
import { PartOfSpeech } from '../../../domain/value-objects/part-of-speech.vo';
import { WordExampleVO } from '../../../domain/value-objects/word-example.vo';
import { WordPronunciationVO } from '../../../domain/value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../../../domain/value-objects/word-sense.vo';
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
    searchResponseGroup: AzVocabSearchResponseDto[],
    definitions: AzVocabDefinitionResponseDto[],
  ): Word | null {
    if (!searchResponseGroup || searchResponseGroup.length === 0) return null;

    // 1. Base Metadata from Primary Search Result (use first entry as base)
    const primary = searchResponseGroup[0];
    const pronunciations = this.mapPronunciations(searchResponseGroup);

    // 2. Aggregate Senses
    const senses: WordSenseVO[] = [];
    const processedDefIds = new Set<string>();

    // 2a. Map full definitions
    for (const defResponse of definitions) {
      if (defResponse?.pageProps?.def) {
        const def = defResponse.pageProps.def;
        const ownerEntry = searchResponseGroup.find((e) =>
          e.defs?.some((d) => d.id === def.id),
        );
        const fallbackPos = ownerEntry?.pos || primary.pos;

        senses.push(this.mapFullDefinitionToSense(def, fallbackPos));
        processedDefIds.add(def.id);
      }
    }

    // 2b. Map remaining partial definitions from all entries
    for (const entry of searchResponseGroup) {
      if (!entry.defs) continue;

      for (const partialDef of entry.defs) {
        if (!processedDefIds.has(partialDef.id)) {
          // Only map if partialDef has essential fields (id, def)
          if (partialDef.id && partialDef.def) {
            senses.push(
              this.mapPartialDefinitionToSense(partialDef, entry.pos),
            );
            processedDefIds.add(partialDef.id);
          }
        }
      }
    }

    if (senses.length === 0) {
      this.logger.warn(`No senses found for word '${primary.vocab}'`);
    }

    return Word.createFromProvider({
      wordProps: {
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
      },
    });
  }

  private mapPronunciations(
    entries: AzVocabSearchResponseDto[],
  ): WordPronunciationVO[] {
    const prons: WordPronunciationVO[] = [];
    const seenMap = new Set<string>();

    for (const entry of entries) {
      if (!entry) continue;

      if (entry.pron_uk || entry.uk) {
        const key = `UK:${entry.pron_uk || ''}:${entry.uk || ''}`;
        if (!seenMap.has(key)) {
          prons.push(
            new WordPronunciationVO({
              ipa: entry.pron_uk || '',
              audioUrl: entry.uk || null,
              region: 'UK',
            }),
          );
          seenMap.add(key);
        }
      }

      if (entry.pron_us || entry.us) {
        const key = `US:${entry.pron_us || ''}:${entry.us || ''}`;
        if (!seenMap.has(key)) {
          prons.push(
            new WordPronunciationVO({
              ipa: entry.pron_us || '',
              audioUrl: entry.us || null,
              region: 'US',
            }),
          );
          seenMap.add(key);
        }
      }
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
