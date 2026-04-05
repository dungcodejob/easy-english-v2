export enum DomainExceptionCode {
  ARGUMENT_NOT_PROVIDED = 'ARGUMENT_NOT_PROVIDED',
  ARGUMENT_INVALID = 'ARGUMENT_INVALID',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  ALREADY_ARCHIVED = 'ALREADY_ARCHIVED',
}

export class DomainException extends Error {
  static readonly prefix = 'Domain';
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.code = `${DomainException.prefix}.${code}`;
    this.details = details;
  }
}

export class ArgumentNotProvidedException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionCode.ARGUMENT_NOT_PROVIDED);
  }
}

export class ArgumentInvalidException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionCode.ARGUMENT_INVALID);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionCode.ENTITY_NOT_FOUND);
  }
}

export class AlreadyArchivedException extends DomainException {
  constructor(message = 'The learning record is already archived') {
    super(message, DomainExceptionCode.ALREADY_ARCHIVED);
  }
}
