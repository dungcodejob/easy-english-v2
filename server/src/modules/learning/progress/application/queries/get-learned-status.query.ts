export class GetLearnedStatusQuery {
  constructor(
    public readonly userId: string,
    public readonly senseIds: string[],
  ) {}
}
