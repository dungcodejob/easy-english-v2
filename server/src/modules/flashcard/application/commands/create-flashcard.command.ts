export class CreateFlashcardCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly front: string,
    public readonly back: string,
    public readonly source: 'dictionary' | 'custom',
    public readonly hint?: string,
    public readonly notes?: string,
    public readonly wordSenseId?: string,
  ) {}
}
