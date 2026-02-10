import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const dictionaryConfig = registerAs('dictionary', () => ({
  azVocab: {
    url: process.env.AZVOCAB_API_URL,
    apiKey: process.env.AZVOCAB_API_KEY,
    timeoutMs: parseInt(process.env.AZVOCAB_TIMEOUT_MS || '5000', 10),
  },
  cache: {
    providerTtlDays: parseInt(process.env.PROVIDER_CACHE_TTL_DAYS || '90', 10),
    provider404TtlHours: parseInt(
      process.env.PROVIDER_CACHE_404_TTL_HOURS || '24',
      10,
    ),
    memoryTtlSeconds: parseInt(
      process.env.MEMORY_CACHE_TTL_SECONDS || '300',
      10,
    ),
  },
}));

export type DictionaryConfig = ConfigType<typeof dictionaryConfig>;
export const InjectDictionaryConfig = () => Inject(dictionaryConfig.KEY);
