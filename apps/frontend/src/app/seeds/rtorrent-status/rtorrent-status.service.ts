import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiReturn, RtorrentStatus } from '@seed-me-home/models';
import { NGXLogger } from 'ngx-logger';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { NotificationService } from '../../notification/notification.service';
import { RefreshService } from '../../refresh/refresh.service';

@Injectable({
  providedIn: 'root',
})
export class RtorrentStatusService {
  private static REFRESH_EVERY = 21 * 1000;
  private static _refreshIsRunning = false;

  API_URL = '/api/rtorrent/status';

  private readonly currentStatusSubject: Subject<RtorrentStatus>;

  //noinspection JSUnusedLocalSymbols
  constructor(
    private readonly httpClient: HttpClient,
    private readonly _notificationService: NotificationService,
    private readonly logger: NGXLogger,
    private readonly _refreshService: RefreshService
  ) {
    this.currentStatusSubject = new ReplaySubject<RtorrentStatus>();
  }

  private _refreshStatus(noTimeout = false) {
    if (this.currentStatusSubject.observers.length > 0) {
      RtorrentStatusService._refreshIsRunning = true;
      this._loadStatus()
        .then((status) => {
          RtorrentStatusService._refreshIsRunning = false;
          this.currentStatusSubject.next(status);
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshStatus();
            }, RtorrentStatusService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(RtorrentStatusService.REFRESH_EVERY / 1000, () => this._forceRefreshTorrentStatus());
          }
        })
        .catch(() => {
          RtorrentStatusService._refreshIsRunning = false;
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshStatus();
            }, RtorrentStatusService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(RtorrentStatusService.REFRESH_EVERY / 1000, () => this._forceRefreshTorrentStatus());
          }
        });
    }
  }

  /**
   * force refreshing of file (without
   */
  private _forceRefreshTorrentStatus() {
    this._refreshStatus(true);
  }

  /**
   * Load the status from backend
   */
  private _loadStatus(): Promise<RtorrentStatus> {
    return new Promise<RtorrentStatus>((resolve, reject) => {
      this.httpClient
        .get<ApiReturn>(this.API_URL)
        .toPromise()
        .then((data: ApiReturn) => {
          const value = data.data as RtorrentStatus;
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
      RtorrentStatusService._refreshIsRunning = false;
    }

    if (!RtorrentStatusService._refreshIsRunning) {
      this._refreshStatus();
    }
  }

  /**
   * Subscribe to know change on this
   */
  currentStatusObservable(): Observable<RtorrentStatus> {
    return this.currentStatusSubject;
  }
}
