export class GetDueCardsQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly limit?: number,
  ) {}
}
