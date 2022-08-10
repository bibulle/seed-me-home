import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiReturn, FilesStatus } from '@seed-me-home/models';
import { NGXLogger } from 'ngx-logger';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { NotificationService } from '../../notification/notification.service';
import { RefreshService } from '../../refresh/refresh.service';

@Injectable({
  providedIn: 'root',
})
export class FilesStatusService {
  private static REFRESH_EVERY = 21 * 1000;
  private static _refreshIsRunning = false;

  API_URL = '/api/files_api/status';

  private readonly currentStatusSubject: Subject<FilesStatus>;

  //noinspection JSUnusedLocalSymbols
  constructor(
    private readonly httpClient: HttpClient,
    private readonly _notificationService: NotificationService,
    private readonly logger: NGXLogger,
    private readonly _refreshService: RefreshService
  ) {
    this.currentStatusSubject = new ReplaySubject<FilesStatus>();
  }

  private _refreshStatus(noTimeout = false) {
    if (this.currentStatusSubject.observers.length > 0) {
      FilesStatusService._refreshIsRunning = true;
      this._loadStatus()
        .then((status) => {
          FilesStatusService._refreshIsRunning = false;
          this.currentStatusSubject.next(status);
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshStatus();
            }, FilesStatusService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(FilesStatusService.REFRESH_EVERY / 1000, () => this._forceRefreshStatus());
          }
        })
        .catch(() => {
          FilesStatusService._refreshIsRunning = false;
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshStatus();
            }, FilesStatusService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(FilesStatusService.REFRESH_EVERY / 1000, () => this._forceRefreshStatus());
          }
        });
    }
  }

  /**
   * force refreshing of file (without
   */
  private _forceRefreshStatus() {
    this._refreshStatus(true);
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
        .catch((error) => {
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
