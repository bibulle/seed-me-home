import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private _userService: UserService) {}

  canActivate(): Promise<boolean> {
    // console.log('canActivate');

    return new Promise<boolean>((resolve, reject) => {
      if (this._userService.isAuthenticate()) {
        // console.log('canActivate true');
        resolve(true);
      } else {
        // not logged in so try to login
        this._userService
          .startLoginGoogle()
          .then(() => {
            // console.log('then OK');
            resolve(true);
          })
          .catch(reason => {
            console.log(reason);
            reject(reason);
          });
      }
    });
  }
}
