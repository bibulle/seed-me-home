import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@seed-me-home/models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class EnvironmentInterceptor implements NestInterceptor {
  readonly logger = new Logger(EnvironmentInterceptor.name);

  constructor(private _configService: ConfigService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // In case it's a stream, don't change the content
        if (data.stream) {
          return data;
        }

        if (!data) {
          data = {};
        }
        if (!data.data) {
          data = { data: data };
        }

        let env = new Environment();
        env = {
          version: env.version,
          hasTorrent: this._configService.get('SEEDBOX_MODE') !== undefined,
          hasDirectDownload: this._configService.get('DIRECT_DOWNLOAD_MODE') !== undefined,
        };
        // add environement
        data.environement = env;

        //this.logger.debug(data);

        return data;
      })
    );
  }
}
