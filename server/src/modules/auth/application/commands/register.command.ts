import { Command } from '@core/ddd';
import { RegisterRequestDto } from '../../dto/requests/register.request.dto';

export class RegisterCommand extends Command {
  constructor(public readonly props: RegisterRequestDto) {
    super(props);
  }
}
