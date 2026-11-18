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
    const parserStatus = bodyParserStatus(exception);
    const status = isHttp
      ? exception.getStatus()
      : (parserStatus ?? HttpStatus.INTERNAL_SERVER_ERROR);

    // 4xx: tell the client what they did wrong — they can fix it.
    // 5xx: a generic message. Details go to the log, never to the client.
    const message = isHttp
      ? clientMessage(exception)
      : parserStatus !== null && exception instanceof Error
        ? exception.message
        : 'Internal server error';

    if (!isHttp && parserStatus === null) {
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
    const msg = body.message;
    if (
      Array.isArray(msg) &&
      msg.every((m): m is string => typeof m === 'string')
    )
      return msg;
    if (typeof msg === 'string') return msg;
  }
  return exception.message;
}

/**
 * Express's body parser rejects some requests before Nest sees them: a body
 * over the size limit gets a PayloadTooLargeError, which is not an
 * HttpException but carries `status: 413`. Without this, the client gets a
 * 500 for its own mistake.
 */
function bodyParserStatus(exception: unknown): number | null {
  if (
    exception instanceof Error &&
    'status' in exception &&
    typeof exception.status === 'number' &&
    exception.status >= 400 &&
    exception.status < 500
  ) {
    return exception.status;
  }
  return null;
}
