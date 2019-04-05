import { Injectable, NgModule } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private readonly _snackBar: MatSnackBar,
    private readonly logger: NGXLogger,
    private _translateService: TranslateService
  ) {}

  error(err: string, ...args: any[]) {
    this.logger.error(err);

    this._prepareMessage(err, ...args).then(mess => {
      this._display(mess, 5000, ['error']);
    });
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
      this.logger.error(`Backend returned code ${error.status}, ` + `body was: ${JSON.stringify(error.error)}`);

      message = error.statusText + ' | translate';
    }

    this.error(message);
    // return an observable with a user-facing error message
    return throwError(message);
  }

  private _prepareMessage(mess: string, ...args: any[]): Promise<string> {
    return new Promise<string>(resolve => {
      if (mess.match('.* [|] translate')) {
        const key = mess.replace(' | translate', '');
        this._translateService.get(key, args).subscribe(translated => {
          resolve(translated);
        });
      } else {
        let output = mess;

        if (args && args.length > 0) {
          args.forEach(arg => {
            output += ' - ' + JSON.stringify(arg);
          });
        }

        resolve(output);
      }
    });
  }
}

@NgModule({
  imports: [HttpClientModule, MatSnackBarModule, TranslateModule.forRoot()],
  declarations: [],
  exports: [],
  providers: [NotificationService, { provide: NGXLogger, useClass: NGXLoggerMock }]
})
export class NotificationModule {}
