export class ListTopicWordsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly topicId: string,
    public readonly top: number = 20,
    public readonly skip: number = 0,
  ) {}
}
