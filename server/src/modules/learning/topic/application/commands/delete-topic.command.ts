export class DeleteTopicCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly topicId: string,
  ) {}
}
