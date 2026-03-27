export class GetLearningListQuery {
  constructor(
    public readonly userId: string,
    public readonly top = 20,
    public readonly skip = 0,
  ) {}
}
