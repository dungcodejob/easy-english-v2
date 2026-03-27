export class ListTopicWordsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly topicId: string,
    public readonly top = 20,
    public readonly skip = 0,
  ) {}
}
