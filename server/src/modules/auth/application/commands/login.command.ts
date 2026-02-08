import { Command } from '@core/ddd';

export interface LoginCommandProps {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export class LoginCommand extends Command {
  constructor(public readonly props: LoginCommandProps) {
    super(props);
  }
}
