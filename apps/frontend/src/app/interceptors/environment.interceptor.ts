import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from '../utils/env/environment.service';

@Injectable()
export class EnvironmentInterceptor implements HttpInterceptor {
  constructor(private _versionService: EnvironmentService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //console.log('VersionInterceptor intercept');

    return next.handle(req).pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const data = event.body;
          if (data && data['environement'] && !data['label.login']) {
            // console.log(data['environement']);
            this._versionService.setEnvironement(data['environement']);
          }
        }
      })
    );
  }
}
