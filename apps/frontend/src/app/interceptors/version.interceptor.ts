import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { VersionService } from '../utils/version/version.service';

@Injectable()
export class VersionInterceptor implements HttpInterceptor {
  constructor(private _versionService: VersionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //console.log('VersionInterceptor intercept');

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const data = event.body;
          if (data && data['version'] && !data['label.login']) {
            // console.log(data['version']);
            VersionService.backendVersion = data['version'];
            this._versionService.checkVersion();
          }
        }
      })
    );
  }
}
