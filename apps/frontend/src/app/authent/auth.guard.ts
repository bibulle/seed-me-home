import { UserService } from '../user/user.service';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuthGuard implements CanActivate {
  //noinspection JSUnusedLocalSymbols
  constructor(private readonly _userService: UserService, private readonly logger: NGXLogger) {}

  canActivate(): Promise<boolean> {
    // this.logger.debug('canActivate');

    return new Promise<boolean>(resolve => {
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
            this.logger.warn('Cannot log to Google');
            this.logger.warn(reason);
            resolve(false);
          });
      }
    });
  }
}

@Injectable()
export class AuthGuardAdmin implements CanActivate {
  constructor(
    private _userService: UserService,
    private readonly _notificationService: NotificationService,
    private readonly logger: NGXLogger
  ) {}

  canActivate(): Promise<boolean> {
    // console.log('canActivate AuthGuardAdmin');

    return new Promise<boolean>(resolve => {
      if (!this._userService.isAuthenticate()) {
        // not logged in so try to login
        this._userService
          .startLoginGoogle()
          .then(() => {
            if (this._userService.isAdminAuthenticate()) {
              // console.log('canActivate true');
              resolve(true);
            } else {
              this._notificationService.error('You are not an administrator');
              resolve(false);
            }
          })
          .catch(reason => {
            this.logger.warn('Cannot log to Google');
            this.logger.warn(reason);
            resolve(false);
          });
      } else {
        if (this._userService.isAdminAuthenticate()) {
          // console.log('canActivate true');
          resolve(true);
        } else {
          this._notificationService.error('You are not an administrator');
          resolve(false);
        }
      }
    });
  }
}
