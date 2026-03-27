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
  sets?: Record<string, unknown>[];
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

export type VocabDto = AzVocabSearchResponseDto & {
  entries: AzVocabSearchResponseDto[];
};
export interface AzVocabDefinitionResponseDto {
  pageProps: {
    def: DefinitionDto;
    vocab: VocabDto;
  };
  __N_SSP: boolean;
}
