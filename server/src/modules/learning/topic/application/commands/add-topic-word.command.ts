export class AddTopicWordCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly topicId: string,
    public readonly wordSenseId: string,
  ) {}
}
