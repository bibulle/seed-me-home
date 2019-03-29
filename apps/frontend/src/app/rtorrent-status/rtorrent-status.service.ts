import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { RtorrentStatus } from '@seed-me-home/models';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class RtorrentStatusService {
  private static REFRESH_EVERY = 10 * 1000;
  private static _refreshIsRunning = false;

  API_URL = '/api/rtorrent/status';

  private readonly currentStatusSubject: Subject<RtorrentStatus>;

  constructor(private readonly httpClient: HttpClient, private readonly _notificationService: NotificationService) {
    this.currentStatusSubject = new ReplaySubject<RtorrentStatus>();
  }

  private _refreshStatus() {
    if (this.currentStatusSubject.observers.length > 0) {
      RtorrentStatusService._refreshIsRunning = true;
      this._loadStatus()
        .then(status => {
          this.currentStatusSubject.next(status);
          setTimeout(() => {
            this._refreshStatus();
          }, RtorrentStatusService.REFRESH_EVERY);
        })
        .catch(() => {
          setTimeout(() => {
            this._refreshStatus();
          }, RtorrentStatusService.REFRESH_EVERY);
        });
    }
  }

  /**
   * Load the status from backend
   */
  private _loadStatus(): Promise<RtorrentStatus> {
    return new Promise<RtorrentStatus>((resolve, reject) => {
      this.httpClient
        .get<RtorrentStatus>(this.API_URL)
        .toPromise()
        .catch(error => {
          this._notificationService.handleError(error);
          reject(error);
        })
        .then((data: RtorrentStatus) => {
          resolve(data);
        });
    });
  }

  /**
   * Initialize the loading of stats
   * @param forceRelaunch SHould force the restarting (should be only useful for tests)
   */
  startLoadingStats(forceRelaunch = false) {
    // console.log('startLoadingStats ' + RtorrentStatusService._refreshIsRunning);

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
