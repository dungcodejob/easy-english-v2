import { UserResponseDto } from './responses/user.response.dto';

export class AuthResultDto {
  readonly user: UserResponseDto;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: Date;
  readonly refreshExpiresAt: Date;

  constructor(props: AuthResultDto) {
    this.user = props.user;
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
    this.expiresAt = props.expiresAt;
    this.refreshExpiresAt = props.refreshExpiresAt;
  }
}
