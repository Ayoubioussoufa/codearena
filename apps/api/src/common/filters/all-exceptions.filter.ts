import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 4xx: tell the client what they did wrong — they can fix it.
    // 5xx: a generic message. Details go to the log, never to the client.
    console.log(exception instanceof HttpException && exception.getResponse());

    const message = isHttp ? clientMessage(exception) : 'Internal server error';

    if (!isHttp) {
      this.logger.error(
        `Unhandled ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

/** A 4xx names what went wrong. The ValidationPipe hides its list in getResponse(). */
function clientMessage(exception: HttpException): string | string[] {
  // body is `string | object`.
  // - a string: return it
  // - an object with a `message` field that's a string or a string[]: return that
  // - anything else: return exception.message
  const body = exception.getResponse();
  if (typeof body === 'string') return body;
  if (typeof body === 'object' && 'message' in body) {
    const msg = (body as Record<string, unknown>).message;
    if (typeof msg === 'string' || Array.isArray(msg)) return msg;
  }
  return exception.message;
}
