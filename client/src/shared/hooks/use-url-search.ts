import {
  type RegisteredRouter,
  type RouteIds,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { cleanEmptyParams } from '../utils';
import { useDebounceCallback } from './use-debounce-callback';

interface UseUrlSearchOptions {
  /** Debounce delay in ms before writing to URL. Default: 300 */
  delay?: number;
  /** URL search param key. Default: 'q' */
  paramKey?: string;
}

/**
 * Manages a single text search param in the URL.
 *
 * - `inputValue`  — immediate local state: bind to `<input value>`.
 * - `handleChange` — call on `<input onChange>`: updates local state instantly
 *                    and debounces the URL update.
 * - `urlValue`    — the value committed to the URL: use for API query params.
 * - `clear()`     — resets local state and removes the param from the URL
 *                   immediately (no debounce).
 *
 * @example
 * ```ts
 * const { inputValue, handleChange, urlValue, clear } = useUrlSearch(
 *   '/_(authenticated)/dictionary/',
 *   { paramKey: 'q', delay: 300 },
 * );
 * ```
 */
export function useUrlSearch<T extends RouteIds<RegisteredRouter['routeTree']>>(
  routeId: T,
  options: UseUrlSearchOptions = {},
) {
  const { delay = 300, paramKey = 'q' } = options;

  const routeApi = getRouteApi<T>(routeId);
  const navigate = useNavigate();
  const search = routeApi.useSearch() as unknown as Record<string, string>;

  const urlKeyword: string = (search[paramKey] as string) || '';

  // Local state mirrors the input; URL state lags by `delay`
  const [keyword, setKeyword] = useState(urlKeyword);

  // Sync input when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setKeyword(urlKeyword);
  }, [urlKeyword]);

  const commitToUrl = useCallback(
    (val: string) => {
      navigate({
        // @ts-expect-error — generic route navigate
        search: (prev: Record<string, unknown>) =>
          cleanEmptyParams({ ...prev, [paramKey]: val }),
      });
    },
    [navigate, paramKey],
  );

  const debouncedCommit = useDebounceCallback(commitToUrl, delay);

  const handleChange = useCallback(
    (val: string) => {
      setKeyword(val);
      debouncedCommit(val);
    },
    [debouncedCommit],
  );

  const clear = useCallback(() => {
    debouncedCommit.cancel();
    setKeyword('');
    navigate({
      // @ts-expect-error — generic route navigate
      search: (prev: Record<string, unknown>) => {
        const next = { ...prev };
        delete next[paramKey];
        return next;
      },
    });
  }, [debouncedCommit, navigate, paramKey]);

  return {
    /** Controlled value for `<input value>` */
    keyword,
    /** Call on `<input onChange>` — instant UI, debounced URL */
    updateKeyword: handleChange,
    /** Value committed to URL — use for API `query` param */
    urlKeyword,
    /** Clear input and remove URL param immediately */
    clear,
  };
}
