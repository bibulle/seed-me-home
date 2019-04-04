import { Injectable, NgModule } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private readonly _snackBar: MatSnackBar, private readonly logger: NGXLogger) {}

  error(err: string) {
    this.logger.error(err);
    this._display(err, 5000, ['error']);
  }

  private _display(message: string, duration: number, extraClasses: [string]) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.panelClass = extraClasses;

    this._snackBar.open(message, null, config);
  }

  handleError(error: HttpErrorResponse) {
    let message = 'Unknown error';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      this.logger.error('An error occurred:', error.error.message);
      message = error.error.message;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      this.logger.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
      message = error.statusText;
    }

    this.error(message);
    // return an observable with a user-facing error message
    return throwError(message);
  }
}

@NgModule({
  imports: [HttpClientModule, MatSnackBarModule],
  declarations: [],
  exports: [],
  providers: [NotificationService]
})
export class NotificationModule {}
