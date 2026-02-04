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
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

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
        deviceId: null,
      }),
    );

    const { accessToken, refreshToken, expiresAt, refreshExpiresAt, user } =
      result;

    // Set Cookies
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshExpiresAt,
      path: '/api/v1/auth/refresh', // Restrict path for refresh token? Or global?
    });

    return new LoginResponseDto({
      user,
      expiresAt,
      refreshExpiresAt,
    });
  }
}
