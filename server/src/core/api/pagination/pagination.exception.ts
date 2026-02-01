import { ApplicationException } from '@core/exceptions';

// Error codes from spec
export enum PaginationErrorException {
  INVALID_TOP = 'PAGINATION_INVALID_TOP',
  INVALID_SKIP = 'PAGINATION_INVALID_SKIP',
  INVALID_CURSOR = 'PAGINATION_INVALID_CURSOR',
  COUNT_NOT_SUPPORTED = 'PAGINATION_COUNT_NOT_SUPPORTED',
}
export class PaginationParseException extends ApplicationException {
  constructor(
    message: string,
    public readonly code: PaginationErrorException,
    public readonly position?: number,
  ) {
    super(message, code, { position });
    this.name = 'PaginationParseException';
  }
}

export class PaginationInvalidTopException extends PaginationParseException {
  constructor(message: string, position?: number) {
    super(message, PaginationErrorException.INVALID_TOP, position);
    this.name = 'PaginationInvalidTopException';
  }
}

export class PaginationInvalidSkipException extends PaginationParseException {
  constructor(field: string, position?: number) {
    super(
      `Invalid skip: ${field}`,
      PaginationErrorException.INVALID_SKIP,
      position,
    );
    this.name = 'PaginationInvalidSkipException';
  }
}

export class PaginationInvalidCursorException extends PaginationParseException {
  constructor(direction: string, position?: number) {
    super(
      `Invalid cursor: ${direction}`,
      PaginationErrorException.INVALID_CURSOR,
      position,
    );
    this.name = 'PaginationInvalidCursorException';
  }
}

export class PaginationCountNotSupportedException extends PaginationParseException {
  constructor(field: string, position?: number) {
    super(
      `Count not supported: ${field}`,
      PaginationErrorException.COUNT_NOT_SUPPORTED,
      position,
    );
    this.name = 'PaginationCountNotSupportedException';
  }
}
