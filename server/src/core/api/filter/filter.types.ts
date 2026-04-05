/**
 * Filter Expression Types
 * Based on Microsoft REST API Guidelines §9.7.1 (OData-style)
 */

import { type ObjectValues } from '@shared/utils';

export const COMPARISON_OPERATORS = {
  equals: 'eq',
  notEquals: 'ne',
  greaterThan: 'gt',
  greaterThanOrEqual: 'ge',
  lessThan: 'lt',
  lessThanOrEqual: 'le',
} as const;

export type ComparisonOperator = ObjectValues<typeof COMPARISON_OPERATORS>;

export const STRING_FUNCTIONS = {
  contains: 'contains',
  startswith: 'startswith',
  endswith: 'endswith',
} as const;

export type StringFunction = ObjectValues<typeof STRING_FUNCTIONS>;

// Logical operators
export const LOGICAL_OPERATORS = {
  and: 'and',
  or: 'or',
  not: 'not',
} as const;

export type LogicalOperator = ObjectValues<typeof LOGICAL_OPERATORS>;

// Value types
export type FilterValue = string | number | boolean | null;

// Filter node types for AST
export interface ComparisonNode {
  type: 'comparison';
  field: string;
  operator: ComparisonOperator;
  value: FilterValue;
}

export interface FunctionCallNode {
  type: 'function';
  name: StringFunction;
  field: string;
  value: string;
}

export interface LogicalNode {
  type: 'logical';
  operator: 'and' | 'or';
  left: FilterNode;
  right: FilterNode;
}

export interface NotNode {
  type: 'not';
  operand: FilterNode;
}

export interface GroupNode {
  type: 'group';
  expression: FilterNode;
}

export type FilterNode =
  | ComparisonNode
  | FunctionCallNode
  | LogicalNode
  | NotNode
  | GroupNode;

// Filter input (raw string from query param)
export interface FilterInput {
  $filter?: string;
}

// Parsed filter result
export interface ParsedFilter {
  raw: string;
  ast: FilterNode;
}
