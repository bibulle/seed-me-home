import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { UserService } from '../user/user.service';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  constructor(private _userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //console.log('RefreshTokenInterceptor intercept');

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const data = event.body;
          //console.log(data);
          if (data && data['refreshToken']) {
            UserService.tokenSetter(data['refreshToken']);
            this._userService.checkAuthentication(true);
          }
        }
      })
    );
  }
}
