import { QueryBase } from '@core/ddd';

export class GetSessionQuery extends QueryBase {
  constructor(public readonly sessionId: string) {
    super();
  }
}
