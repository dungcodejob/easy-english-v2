export class GetLearningListQuery {
  constructor(
    public readonly userId: string,
    public readonly top: number = 20,
    public readonly skip: number = 0,
  ) {}
}
