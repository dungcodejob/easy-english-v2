import { Injectable, Logger } from '@nestjs/common';
import { WordExampleVO } from '../../../domain/value-objects/word-example.vo';
import { WordPronunciationVO } from '../../../domain/value-objects/word-pronunciation.vo';
import { WordSenseVO } from '../../../domain/value-objects/word-sense.vo';
import { WordSnapshot } from '../../../domain/value-objects/word-snapshot.vo';
import {
  AzVocabDefinitionResponseDto,
  AzVocabSearchResponseDto,
  DefinitionDto,
} from './azvocab.types';

@Injectable()
export class AzVocabAdapter {
  private readonly logger = new Logger(AzVocabAdapter.name);

  toDomain(
    searchResponses: AzVocabSearchResponseDto[],
    definitions: AzVocabDefinitionResponseDto[],
  ): WordSnapshot | null {
    if (!searchResponses || searchResponses.length === 0) {
      return null;
    }

    // 1. Base Metadata from Primary Search Result
    const primary = searchResponses[0];
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

    // 2b. Fallback to partial definitions from search results if not fetched
    for (const searchEntry of searchResponses) {
      if (searchEntry.defs) {
        for (const partialDef of searchEntry.defs) {
          if (!processedDefIds.has(partialDef.id)) {
            // Only map if partialDef has essential fields (id, def)
            if (partialDef.id && partialDef.def) {
              senses.push(
                this.mapPartialDefinitionToSense(partialDef, searchEntry.pos),
              );
              processedDefIds.add(partialDef.id);
            }
          }
        }
      }
    }

    if (senses.length === 0) {
      this.logger.warn(`No senses found for word '${primary.vocab}'`);
      // Return null if no meaningful content found? Or return snapshot with empty senses?
      // Given requirements, let's return null to signify incomplete data if that's preferred,
      // but usually a word exists even without definitions.
      // However, WordSnapshot validation might require senses.
      // Let's return the snapshot, as pronunciations might be useful.
    }

    return new WordSnapshot({
      text: primary.vocab,
      normalizedText: primary.vocab.toLowerCase(),
      language: 'en',
      source: 'azvocab',
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
        examples.push(
          new WordExampleVO({
            text: sample.text,
            translationVi: null,
            order: index + 1,
          }),
        );
      });
    }

    return new WordSenseVO({
      partOfSpeech: def.pos || fallbackPos,
      definition: def.def,
      shortDefinition: null,
      cefrLevel: def.level || null,
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
      partOfSpeech: def.pos || fallbackPos,
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
