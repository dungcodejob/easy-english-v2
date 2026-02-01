import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../application/commands/register.command';
import { RegisterRequestDto } from '../dto/requests/register.request.dto';
import { RegisterResponseDto } from '../dto/responses/register.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.commandBus.execute(new RegisterCommand(dto));
  }
}
