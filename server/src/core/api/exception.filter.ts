import { randomUUID } from 'node:crypto';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { ApplicationException, DomainException } from '../exceptions';
import { ApiResponse } from './response.builder';
import { ErrorType } from './response.types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId =
      (request.headers['x-correlation-id'] as string) || randomUUID();

    let status: number;
    let code: string;
    let message: string;
    let type: ErrorType;
    let details: Record<string, unknown> | undefined;

    if (exception instanceof DomainException) {
      status = HttpStatus.CONFLICT;
      code = exception.code;
      message = exception.message;
      type = ErrorType.DOMAIN;
      details = exception.details;
    } else if (exception instanceof ApplicationException) {
      status = HttpStatus.BAD_REQUEST;
      code = exception.code;
      message = exception.message;
      type = ErrorType.CLIENT;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      type = status >= 500 ? ErrorType.SYSTEM : ErrorType.CLIENT;
      code = `HTTP_${status}`;

      if (typeof responseBody === 'object' && responseBody !== null) {
        const body = responseBody as Record<string, unknown>;

        message = (body.message as string) || exception.message;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        details = body.error ? { error: body.error } : undefined;
      } else {
        message = exception.message;
      }
    } else {
      // System Error
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_SERVER_ERROR';
      message = 'An unexpected error occurred.';
      type = ErrorType.SYSTEM;

      this.logger.error(
        `[${correlationId}] ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = ApiResponse.error(code, message, type, {
      correlationId,
      // Map details object to ErrorDetail[] if needed, or keeping it strictly Typed
      // For now, we will just use the message and generic details.
      // If specific validation details are needed, we'd format them here.
    });

    response.status(status).json(errorResponse);
  }
}
