export class UserResponseDto {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly tenantId: string,
  ) {}
}

export interface TokenResultDto {
  readonly token: string;
  readonly expiresAt: Date;
}

export interface LoginResponseDto {
  readonly user: UserResponseDto;
  readonly accessToken: TokenResultDto;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  tenantName?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  tenantId: string;
}

export interface AuthError {
  message: string;
  error: string;
  statusCode: number;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}
