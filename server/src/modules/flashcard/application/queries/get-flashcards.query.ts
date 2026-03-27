export class GetFlashcardsQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
