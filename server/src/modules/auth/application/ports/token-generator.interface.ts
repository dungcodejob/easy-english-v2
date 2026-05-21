export interface ITokenPayload {
  userId: string;
  tenantId: string;
  email: string;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
