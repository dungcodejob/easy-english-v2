import { DomainException } from '@core/exceptions';

export enum AuthErrorCodes {
  BASE = 'AUTH',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
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
