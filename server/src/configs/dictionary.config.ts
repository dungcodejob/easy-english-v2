import { Inject } from '@nestjs/common';
import { type ConfigType, registerAs } from '@nestjs/config';

export const dictionaryConfig = registerAs('dictionary', () => ({
  azVocab: {
    url: process.env.AZVOCAB_API_URL,
    // Legacy service uses a hardcoded cookie. We support env var for it.
    // If AZVOCAB_COOKIE is set, use it. Otherwise fallback to AZVOCAB_API_KEY (repurposed) or empty.
    cookie: process.env.AZVOCAB_COOKIE || process.env.AZVOCAB_API_KEY,
    buildId: process.env.AZVOCAB_BUILD_ID || 'XA-Q-SMak7Pp_80mj4dTo', // Default from legacy service, but should be env var
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
