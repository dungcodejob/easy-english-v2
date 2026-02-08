export class UserResponseDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly tenantId: string,
  ) {}
}
