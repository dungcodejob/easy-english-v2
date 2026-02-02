import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsPasswordStrong } from '../validators/password.validator';

export class RegisterRequestDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  @IsPasswordStrong()
  readonly password!: string;

  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsString()
  @IsOptional()
  readonly tenantName?: string;
}
