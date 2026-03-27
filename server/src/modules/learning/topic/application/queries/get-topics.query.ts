export class GetTopicsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly top = 20,
    public readonly skip = 0,
  ) {}
}
