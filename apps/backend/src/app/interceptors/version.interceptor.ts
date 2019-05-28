import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Version } from '@seed-me-home/models';

@Injectable()
export class VersionInterceptor implements NestInterceptor {
  readonly logger = new Logger(VersionInterceptor.name);
  readonly version = new Version().version;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (!data) {
          data = {};
        }
        if (!data.data) {
          data = { data: data };
        }

        // add version
        data.version = this.version;

        //this.logger.debug(data);

        return data;
      })
    );
  }
}
