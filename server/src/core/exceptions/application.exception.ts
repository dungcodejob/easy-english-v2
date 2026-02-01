export class ApplicationException extends Error {
  static readonly prefix = 'Application';
  code: string;
  details?: Record<string, unknown>;
  errorCode: string;

  constructor(
    message: string,
    code: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.code = `${ApplicationException.prefix}.${code}`;
    this.details = details;
  }
}
