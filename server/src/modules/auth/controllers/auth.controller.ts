import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAuthErrors } from '../../../shared/decorators/http/api-error-responses.decorator';
import { LoginCommand } from '../application/commands/login.command';
import { RegisterCommand } from '../application/commands/register.command';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from '../dto/requests/login.dto';
import { RegisterDto } from '../dto/requests/register.dto';
import { AuthTokensDto } from '../dto/responses/auth-tokens.dto';

@ApiTags('auth')
@Controller('auth')
@ApiAuthErrors()
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthTokensDto,
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto): Promise<AuthTokensDto> {
    return this.commandBus.execute(new RegisterCommand(dto));
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with existing credentials' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: AuthTokensDto,
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    return this.commandBus.execute(new LoginCommand(dto));
  }
}
