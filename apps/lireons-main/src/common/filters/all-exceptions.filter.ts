import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

type PrismaLikeError = {
  code?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) || randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const obj = payload as Record<string, unknown>;
        const maybeMessage = obj.message;
        if (Array.isArray(maybeMessage)) {
          message = maybeMessage.join(', ');
          details = maybeMessage;
        } else if (typeof maybeMessage === 'string') {
          message = maybeMessage;
        }
        if (typeof obj.error === 'string') {
          code = obj.error.toUpperCase().replace(/\s+/g, '_');
        }
      } else {
        message = exception.message;
      }

      if (!code || code === 'INTERNAL_SERVER_ERROR') {
        code = this.httpStatusToCode(status);
      }
    } else {
      const prismaError = exception as PrismaLikeError;
      if (prismaError?.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        message = 'A record with this value already exists';
        details = prismaError.meta;
      } else if (prismaError?.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'RECORD_NOT_FOUND';
        message = 'Requested record was not found';
      } else if (exception instanceof Error) {
        message = exception.message || message;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} failed: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`[${requestId}] ${request.method} ${request.url}: ${message}`);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      requestId,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private httpStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_FAILED';
      default:
        return 'HTTP_ERROR';
    }
  }
}
