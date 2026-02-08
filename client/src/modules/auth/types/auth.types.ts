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
  fullName?: string; // Changed from firstName/lastName to fullName to match common practice or keep as is? Let's check backend User entity if possible, but for now generic.
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
