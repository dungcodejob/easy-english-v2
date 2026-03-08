export class RemoveTopicWordCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly topicId: string,
    public readonly wordSenseId: string,
  ) {}
}
