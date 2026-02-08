import { QueryBase } from '@core/ddd';

export class ValidateSessionQuery extends QueryBase {
  constructor(public readonly sessionId: string) {
    super();
  }
}
