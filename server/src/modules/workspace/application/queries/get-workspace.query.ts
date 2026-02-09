import { QueryBase } from '@core/ddd';

export class GetWorkspaceQuery extends QueryBase {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {
    super();
  }
}
