import { ApplicationException } from '@core/exceptions';

// Error codes from spec
export enum SortErrorException {
  UNKNOWN_FIELD = 'SORT_UNKNOWN_FIELD',
  INVALID_DIRECTION = 'SORT_INVALID_DIRECTION',
  FIELD_NOT_ALLOWED = 'SORT_FIELD_NOT_ALLOWED',
  SYNTAX_ERROR = 'SORT_SYNTAX_ERROR',
}
export class SortParseException extends ApplicationException {
  constructor(
    message: string,
    public readonly code: SortErrorException,
    public readonly position?: number,
  ) {
    super(message, code, { position });
    this.name = 'SortParseException';
  }
}

export class SortSyntaxException extends SortParseException {
  constructor(message: string, position?: number) {
    super(message, SortErrorException.SYNTAX_ERROR, position);
    this.name = 'SortSyntaxException';
  }
}

export class SortUnknownFieldException extends SortParseException {
  constructor(field: string, position?: number) {
    super(
      `Unknown field: ${field}`,
      SortErrorException.UNKNOWN_FIELD,
      position,
    );
    this.name = 'SortUnknownFieldException';
  }
}

export class SortInvalidDirectionException extends SortParseException {
  constructor(direction: string, position?: number) {
    super(
      `Invalid direction: ${direction}`,
      SortErrorException.INVALID_DIRECTION,
      position,
    );
    this.name = 'SortInvalidDirectionException';
  }
}

export class SortFieldNotAllowedException extends SortParseException {
  constructor(field: string, position?: number) {
    super(
      `Field not allowed: ${field}`,
      SortErrorException.FIELD_NOT_ALLOWED,
      position,
    );
    this.name = 'SortFieldNotAllowedException';
  }
}
