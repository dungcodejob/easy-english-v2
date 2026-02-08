import { UserResponseDto } from './user.response.dto';

export interface TokenResultDto {
  readonly token: string;
  readonly expiresAt: Date;
}

export interface LoginResponseDto {
  readonly user: UserResponseDto;
  readonly accessToken: TokenResultDto;
}
