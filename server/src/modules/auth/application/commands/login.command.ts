import { LoginDto } from '../../dto/requests/login.dto';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}
