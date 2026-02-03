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
