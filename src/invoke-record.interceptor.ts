import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvokeRecordInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const response = context.switchToHttp().getResponse<Response>();

    const userAgent = request.headers['user-agent'];

    const { ip, method, path } = request;

    this.logger.debug(
      `${method} ${path} ${ip} ${userAgent}: ${context.getClass().name} invoked...`,
    );

    this.logger.debug(`user:${request.user?.userId},${request.user?.username}`);

    const now = Date.now();

    //pipe()是rxjs中的管道操作符，可以对Observable进行一系列的转换
    //tap()用于执行副作用，不会修改Observable中的数据
    return next.handle().pipe(
      tap((res) => {
        this.logger.debug(
          `${method} ${path} ${ip} ${userAgent}: ${response.statusCode}: ${Date.now() - now}ms`,
        );

        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      }),
    );
  }
}
