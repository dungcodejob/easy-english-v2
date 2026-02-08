import { QueryBase } from '@core/ddd';

export class CheckHasWorkspaceQuery extends QueryBase {
  constructor(public readonly userId: string) {
    super();
  }
}
