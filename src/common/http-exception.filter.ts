import { BadRequestException, ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const message = exception.message;
    message.timestamp = new Date().toISOString();
    message.path = request.url;

    response
      .status(exception.getStatus())
      .json(message);
  }
}