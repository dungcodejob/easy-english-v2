export class RegisterRequestDto {
  name!: string;
  email!: string;
  password!: string;
  // Optional tenant details if creating one, or tenantId if joining
  // For MVP, maybe just name/email/password and auto-assign default tenant
}
