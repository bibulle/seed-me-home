import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private static _snackBar = null;

  constructor(private _aSnackBar: MatSnackBar) {
    NotificationService._snackBar = _aSnackBar;
  }

  static error(err: string) {
    console.error(err);
    //console.error(message);
    NotificationService._display(err, 5000, ['error']);
  }

  private static _display(message: string, duration: number, extraClasses: [string]) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.panelClass = extraClasses;

    NotificationService._snackBar.open(message, null, config);
  }

  static handleError(error: HttpErrorResponse) {
    let message = 'Unknown error';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
      message = error.error.message;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
      message = error.statusText;
    }

    NotificationService.error(message);
    // return an observable with a user-facing error message
    return throwError(message);
  }
}
