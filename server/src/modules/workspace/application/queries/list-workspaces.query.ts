import { QueryBase } from '@core/ddd';

export class ListWorkspacesQuery extends QueryBase {
  constructor(public readonly userId: string) {
    super();
  }
}
