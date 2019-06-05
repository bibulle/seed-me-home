import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ApiReturn, FilesStatus } from '@seed-me-home/models';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../notification/notification.service';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class FilesStatusService {
  private static REFRESH_EVERY = 21 * 1000;
  private static _refreshIsRunning = false;

  API_URL = environment.serverUrl + 'files_api/status';

  private readonly currentStatusSubject: Subject<FilesStatus>;

  //noinspection JSUnusedLocalSymbols
  constructor(
    private readonly httpClient: HttpClient,
    private readonly _notificationService: NotificationService,
    private readonly logger: NGXLogger
  ) {
    this.currentStatusSubject = new ReplaySubject<FilesStatus>();
  }

  private _refreshStatus() {
    if (this.currentStatusSubject.observers.length > 0) {
      FilesStatusService._refreshIsRunning = true;
      this._loadStatus()
        .then(status => {
          FilesStatusService._refreshIsRunning = false;
          this.currentStatusSubject.next(status);
          setTimeout(() => {
            this._refreshStatus();
          }, FilesStatusService.REFRESH_EVERY);
        })
        .catch(() => {
          FilesStatusService._refreshIsRunning = false;
          setTimeout(() => {
            this._refreshStatus();
          }, FilesStatusService.REFRESH_EVERY);
        });
    }
  }

  /**
   * Load the status from backend
   */
  private _loadStatus(): Promise<FilesStatus> {
    return new Promise<FilesStatus>((resolve, reject) => {
      this.httpClient
        .get<ApiReturn>(this.API_URL)
        .toPromise()
        .then((data: ApiReturn) => {
          const value = data.data as FilesStatus;
          resolve(value);
        })
        .catch(error => {
          this._notificationService.handleError(error);
          reject(error);
        });
    });
  }

  /**
   * Initialize the loading of stats
   * @param forceRelaunch Should force the restarting (should be only useful for tests)
   */
  startLoadingStats(forceRelaunch = false) {
    // this.logger.debug('startLoadingStats ' + RtorrentTorrentsService._refreshIsRunning);

    if (forceRelaunch) {
      FilesStatusService._refreshIsRunning = false;
    }

    if (!FilesStatusService._refreshIsRunning) {
      this._refreshStatus();
    }
  }

  /**
   * Subscribe to know change on this
   */
  currentStatusObservable(): Observable<FilesStatus> {
    return this.currentStatusSubject;
  }
}
