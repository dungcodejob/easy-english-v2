export class UpdateTopicCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly topicId: string,
    public readonly name: string,
    public readonly description?: string,
  ) {}
}
