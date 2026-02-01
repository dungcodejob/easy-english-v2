import { ApplicationException } from '@core/exceptions';

// Error codes from spec
export enum FilterErrorException {
  SYNTAX_ERROR = 'FILTER_SYNTAX_ERROR',
  UNKNOWN_FIELD = 'FILTER_UNKNOWN_FIELD',
  INVALID_OPERATOR = 'FILTER_INVALID_OPERATOR',
  TYPE_MISMATCH = 'FILTER_TYPE_MISMATCH',
  UNBALANCED_PARENS = 'FILTER_UNBALANCED_PARENS',
}

export class FilterParseException extends ApplicationException {
  constructor(
    message: string,
    public readonly code: FilterErrorException,
    public readonly position?: number,
  ) {
    super(message, code, { position });
    this.name = 'FilterParseException';
  }
}

export class FilterSyntaxException extends FilterParseException {
  constructor(message: string, position?: number) {
    super(message, FilterErrorException.SYNTAX_ERROR, position);
    this.name = 'FilterSyntaxException';
  }
}

export class FilterUnknownFieldException extends FilterParseException {
  constructor(field: string, position?: number) {
    super(
      `Unknown field: ${field}`,
      FilterErrorException.UNKNOWN_FIELD,
      position,
    );
    this.name = 'FilterUnknownFieldException';
  }
}

export class FilterInvalidOperatorException extends FilterParseException {
  constructor(operator: string, position?: number) {
    super(
      `Invalid operator: ${operator}`,
      FilterErrorException.INVALID_OPERATOR,
      position,
    );
    this.name = 'FilterInvalidOperatorException';
  }
}

export class FilterTypeMismatchException extends FilterParseException {
  constructor(message: string, position?: number) {
    super(message, FilterErrorException.TYPE_MISMATCH, position);
    this.name = 'FilterTypeMismatchException';
  }
}

export class FilterUnbalancedParensException extends FilterParseException {
  constructor(message: string, position?: number) {
    super(message, FilterErrorException.UNBALANCED_PARENS, position);
    this.name = 'FilterUnbalancedParensException';
  }
}
