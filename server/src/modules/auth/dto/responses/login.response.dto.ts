import { UserResponseDto } from './user.response.dto';

export class LoginResponseDto {
  readonly user!: UserResponseDto;
  readonly expiresAt!: Date;
  readonly refreshExpiresAt!: Date;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
