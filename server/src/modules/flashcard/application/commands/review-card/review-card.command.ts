export class ReviewCardCommand {
  constructor(
    public readonly cardId: string,
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly rating: 1 | 2 | 3 | 4,
    public readonly reviewDurationMs: number,
  ) {}
}
