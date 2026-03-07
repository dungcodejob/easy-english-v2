import { DomainException } from '@core/exceptions';

export enum AuthErrorCodes {
  BASE = 'AUTH',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  INVALID_TOKEN_PURPOSE = 'INVALID_TOKEN_PURPOSE',
}

export class AuthDomainException extends DomainException {
  constructor(message: string, code: string) {
    super(message, `${AuthErrorCodes.BASE}.${code}`);
  }
}

export class EmailAlreadyExistsException extends AuthDomainException {
  constructor(email: string) {
    super(
      `Email ${email} is already registered`,
      AuthErrorCodes.EMAIL_ALREADY_EXISTS,
    );
  }
}

export class SessionNotFoundException extends AuthDomainException {
  constructor(sessionId: string) {
    super(
      `Session with ID ${sessionId} not found`,
      AuthErrorCodes.SESSION_NOT_FOUND,
    );
  }
}

export class InvalidCredentialsException extends AuthDomainException {
  constructor() {
    super(`Invalid credentials`, AuthErrorCodes.INVALID_CREDENTIALS);
  }
}

export class InvalidRefreshTokenException extends AuthDomainException {
  constructor() {
    super(
      `Invalid or expired refresh token`,
      AuthErrorCodes.INVALID_REFRESH_TOKEN,
    );
  }
}

export class InvalidTokenPurposeException extends AuthDomainException {
  constructor() {
    super(`Invalid token purpose`, AuthErrorCodes.INVALID_TOKEN_PURPOSE);
  }
}
