export class CreateTopicCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description?: string,
  ) {}
}
