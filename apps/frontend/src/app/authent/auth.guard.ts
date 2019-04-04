import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly _userService: UserService, private readonly logger: NGXLogger) {}

  canActivate(): Promise<boolean> {
    // this.logger.debug('canActivate');

    return new Promise<boolean>((resolve, reject) => {
      if (this._userService.isAuthenticate()) {
        // this.logger.debug('canActivate true');
        resolve(true);
      } else {
        // not logged in so try to login
        this._userService
          .startLoginGoogle()
          .then(() => {
            // this.logger.debug('then OK');
            resolve(true);
          })
          .catch(reason => {
            this.logger.warn(reason);
            reject(reason);
          });
      }
    });
  }
}
