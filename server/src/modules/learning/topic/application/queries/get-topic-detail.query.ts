export class GetTopicDetailQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly id: string,
  ) {}
}
