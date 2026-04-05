import { DomainException } from '@core/exceptions';

export enum ProgressErrorCodes {
  BASE = 'PROGRESS',
  ALREADY_ARCHIVED = 'ALREADY_ARCHIVED',
}

export class ProgressDomainException extends DomainException {
  constructor(message: string, code: string) {
    super(message, `${ProgressErrorCodes.BASE}.${code}`);
  }
}

export class AlreadyArchivedException extends ProgressDomainException {
  constructor(wordSenseId?: string) {
    super(
      wordSenseId
        ? `Word sense ${wordSenseId} is already archived`
        : 'The learning record is already archived',
      ProgressErrorCodes.ALREADY_ARCHIVED,
    );
  }
}
