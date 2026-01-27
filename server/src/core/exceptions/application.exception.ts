export class ApplicationException extends Error {
  errorCode: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    errorCode: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.errorCode = errorCode;
    this.details = details;
  }
}
