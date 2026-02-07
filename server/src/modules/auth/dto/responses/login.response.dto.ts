import { UserResponseDto } from './user.response.dto';

export class LoginResponseDto {
  readonly user!: UserResponseDto;
  readonly accessToken!: string;
  readonly expiresAt!: Date;
  readonly refreshExpiresAt!: Date;

  constructor(props: LoginResponseDto) {
    this.user = props.user;
    this.accessToken = props.accessToken;
    this.expiresAt = props.expiresAt;
    this.refreshExpiresAt = props.refreshExpiresAt;
  }
}
