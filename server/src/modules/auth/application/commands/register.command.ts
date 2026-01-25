import { RegisterDto } from '../../dto/requests/register.dto';

export class RegisterCommand {
  constructor(public readonly dto: RegisterDto) {}
}
