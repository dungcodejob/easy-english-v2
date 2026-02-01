export class RegisterRequestDto {
  readonly email!: string;
  readonly password!: string;
  readonly name!: string;
  readonly tenantName?: string;
}
