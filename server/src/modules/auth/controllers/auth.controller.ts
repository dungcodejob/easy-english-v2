import { Body, Controller, Ip, Post, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request, Response } from 'express';
import { LoginCommand } from '../application/commands/login.command';
import { RegisterCommand } from '../application/commands/register.command';
import { AuthResultDto } from '../dto/auth-result.dto';
import { LoginRequestDto } from '../dto/requests/login.request.dto';
import { RegisterRequestDto } from '../dto/requests/register.request.dto';
import { LoginResponseDto } from '../dto/responses/login.response.dto';
import { RegisterResponseDto } from '../dto/responses/register.response.dto';
import { UserSessionCookie } from '../infrastructure/services/user-session-cookie';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userSessionCookie: UserSessionCookie,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    return this.commandBus.execute(new RegisterCommand(dto));
  }

  @Post('login')
  // @Throttle({ default: { limit: 10, ttl: 60000 } }) // TODO: Enable Throttle
  async login(
    @Body() dto: LoginRequestDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const userAgent = req.headers['user-agent'] || '';

    const result: AuthResultDto = await this.commandBus.execute(
      new LoginCommand({
        email: dto.email,
        password: dto.password,
        ipAddress,
        userAgent,
        deviceId: undefined,
      }),
    );

    const { accessToken, refreshToken, user } = result;

    // Set only refresh token and session ID in httpOnly cookies
    // Access token is returned in response body for client-side state management
    this.userSessionCookie.set(response, refreshToken);

    return new LoginResponseDto({
      user,
      accessToken,
    });
  }
}
