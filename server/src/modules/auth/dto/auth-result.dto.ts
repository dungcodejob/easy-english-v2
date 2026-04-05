import { type UserResponseDto } from './responses/user.response.dto';

export interface TokenResultDto {
  readonly token: string;
  readonly expiresAt: Date;
}

export class AuthResultDto {
  readonly user: UserResponseDto;
  readonly sessionId: string;
  readonly accessToken: TokenResultDto;
  readonly refreshToken: TokenResultDto;

  constructor(props: AuthResultDto) {
    this.user = props.user;
    this.sessionId = props.sessionId;
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
  }
}
