import {
  SortInvalidDirectionException,
  SortSyntaxException,
} from './sort.exception';
import { type SortDirection, type SortEntry } from './sort.types';

/**
 * Parse $orderby string into SortEntry array
 * Format: "field1 asc, field2 desc, field3"
 */
export function parseOrderBy(orderby: string): SortEntry[] {
  if (!orderby || orderby.trim() === '') {
    return [];
  }

  const entries: SortEntry[] = [];
  const parts = orderby.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (!part) continue;

    const tokens = part.split(/\s+/);
    const field = tokens[0];
    const directionToken = tokens[1]?.toLowerCase();

    if (!field) {
      throw new SortSyntaxException('Empty field name');
    }

    let direction: SortDirection = 'asc'; // default

    if (directionToken) {
      if (directionToken !== 'asc' && directionToken !== 'desc') {
        throw new SortInvalidDirectionException(
          `Invalid sort direction: ${directionToken}`,
        );
      }
      direction = directionToken;
    }

    entries.push({ field, direction });
  }

  return entries;
}
