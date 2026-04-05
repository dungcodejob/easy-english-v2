export class UpdateFlashcardCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly front: string,
    public readonly back: string,
    public readonly hint?: string,
    public readonly notes?: string,
  ) {}
}
