export enum DomainExceptionCode {
  ARGUMENT_NOT_PROVIDED = 'ARGUMENT_NOT_PROVIDED',
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
