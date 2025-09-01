import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException } from "@nestjs/common"
import type { Request, Response } from "express"

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    const exceptionResponse = exception.getResponse()
    let message = exception.message

    // Si viene de ValidationPipe, getResponse() trae los detalles
    if (
      typeof exceptionResponse === "object" &&
      exceptionResponse !== null &&
      (exceptionResponse as any).message
    ) {
      message = (exceptionResponse as any).message
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    }

    response.status(status).json(errorResponse)
  }
}
