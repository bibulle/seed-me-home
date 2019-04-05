import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = context.getClass().name + ' ' + context.getHandler().name;
    const now = Date.now();

    this.logger.log(`Called : ${message}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`  Done : ${message} - ${Date.now() - now}ms`);
      })
    );
  }
}
