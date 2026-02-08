import { TokenResultDto } from '../auth-result.dto';
import { UserResponseDto } from './user.response.dto';

export class LoginResponseDto {
  readonly user: UserResponseDto;
  readonly accessToken: TokenResultDto;

  constructor(props: LoginResponseDto) {
    this.user = props.user;
    this.accessToken = props.accessToken;
  }
}
