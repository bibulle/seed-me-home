import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiReturn, DirectDownload } from '@seed-me-home/models';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { NotificationService } from '../../notification/notification.service';
import { RefreshService } from '../../refresh/refresh.service';

@Injectable({
  providedIn: 'root',
})
export class DirectDownloadService {
  private static REFRESH_EVERY = 60 * 1000;
  private static _refreshIsRunning = false;

  API_URL_ADD_URL = '/api/direct/add';
  API_URL = '/api/direct/direct-downloads';

  private readonly currentDownloadsSubject: Subject<DirectDownload[]>;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly _httpClient: HttpClient,
    private readonly _notificationService: NotificationService,
    private readonly _refreshService: RefreshService
  ) {
    this.currentDownloadsSubject = new ReplaySubject<DirectDownload[]>();
  }

  /**
   * Initialize the loading of downloads
   * @param forceRelaunch Should force the restarting (should be only useful for tests)
   */
  startLoadingDownloads(forceRelaunch = false) {
    // this.logger.debug('startLoadingDownloads ');

    if (forceRelaunch) {
      DirectDownloadService._refreshIsRunning = false;
    }

    if (!DirectDownloadService._refreshIsRunning) {
      this._refreshDownloads();
    }
  }

  private _refreshDownloads(noTimeout = false) {
    if (this.currentDownloadsSubject.observed) {
      this._refreshService.setRefreshing(true);
      DirectDownloadService._refreshIsRunning = true;
      this._loadDownloads()
        .then((downloads) => {
          DirectDownloadService._refreshIsRunning = false;
          this.currentDownloadsSubject.next(downloads);
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshDownloads();
            }, DirectDownloadService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(DirectDownloadService.REFRESH_EVERY / 1000, () => this._forceRefreshDownloads());
          }
          this._refreshService.setRefreshing(false);
        })
        .catch(() => {
          DirectDownloadService._refreshIsRunning = false;
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshDownloads();
            }, DirectDownloadService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(DirectDownloadService.REFRESH_EVERY / 1000, () => this._forceRefreshDownloads());
          }
          this._refreshService.setRefreshing(false);
        });
    }
  }

  /**
   * Load the Torrents from backend
   */
  private _loadDownloads(): Promise<DirectDownload[]> {
    return new Promise<DirectDownload[]>((resolve, reject) => {
      this.httpClient
        .get<ApiReturn>(this.API_URL)
        .toPromise()
        .then((data: ApiReturn) => {
          const value = data.data as DirectDownload[];
          value.forEach((v) => {
            console.log(v.downloadStarted);
            v.downloadStarted = new Date(v.downloadStarted);
            console.log(v.downloadStarted);
          });
          resolve(value);
        })
        .catch((error) => {
          this._notificationService.handleError(error);
          reject(error);
        });
    });
  }

  /**
   * force refreshing of file
   */
  private _forceRefreshDownloads() {
    this._refreshDownloads(true);
  }

  /**
   * Subscribe to know change on this
   */
  currentDownloadsObservable(): Observable<DirectDownload[]> {
    return this.currentDownloadsSubject;
  }

  addUrl(url: string): Promise<void> {
    console.log(url);
    return new Promise<void>((resolve, reject) => {
      this._httpClient
        .post(this.API_URL_ADD_URL, { url: url })
        .toPromise()
        .then(() => {
          this._forceRefreshDownloads();
          //this.logger.debug('addUrl OK');
          resolve();
        })
        .catch((error) => {
          //this.logger.debug('addUrl KO');
          this._notificationService.handleError(error);
          reject(error);
        });
    });
  }
}
