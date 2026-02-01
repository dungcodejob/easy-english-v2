/**
 * Sort Expression Types
 * Based on Microsoft REST API Guidelines $orderby semantics
 */

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Single sort entry
export interface SortEntry {
  field: string;
  direction: SortDirection;
}

// Sort input (raw string from query param)
export interface SortInput {
  $orderby?: string;
}

// Parsed sort result
export interface ParsedSort {
  raw: string;
  entries: SortEntry[];
}
