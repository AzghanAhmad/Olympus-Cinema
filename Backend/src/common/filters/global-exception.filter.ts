import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        message = (obj.message as string) ?? message;
        errors = obj.errors ?? obj.message;
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as { code: unknown }).code === 'string'
    ) {
      const prismaError = exception as { code: string; message: string; meta?: Record<string, unknown> };
      if (prismaError.code === 'P2003') {
        status = HttpStatus.CONFLICT;
        message = 'Cannot delete or modify record because it is referenced by existing bookings or related data.';
      } else if (prismaError.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found.';
      } else if (prismaError.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'A record with this unique value already exists.';
      } else {
        this.logger.error(`Prisma error [${prismaError.code}]: ${prismaError.message}`);
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception);
    }

    const isProd = process.env.NODE_ENV === 'production';
    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message.join(', ') : message,
      errors: status < 500 ? errors : undefined,
      ...(isProd ? {} : { path: request.url }),
    });
  }
}
