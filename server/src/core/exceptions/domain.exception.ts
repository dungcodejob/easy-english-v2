export enum DomainExceptionCode {
  ARGUMENT_NOT_PROVIDED = 'ARGUMENT_NOT_PROVIDED',
}

export class DomainException extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export class ArgumentNotProvidedException extends DomainException {
  constructor(message: string) {
    super(message, DomainExceptionCode.ARGUMENT_NOT_PROVIDED);
  }
}
