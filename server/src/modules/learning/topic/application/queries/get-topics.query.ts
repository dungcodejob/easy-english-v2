export class GetTopicsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly top: number = 20,
    public readonly skip: number = 0,
  ) {}
}
