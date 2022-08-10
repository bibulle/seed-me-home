import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiReturn, RtorrentTorrent } from '@seed-me-home/models';
import { NGXLogger } from 'ngx-logger';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { NotificationService } from '../../notification/notification.service';
import { RefreshService } from '../../refresh/refresh.service';

@Injectable({
  providedIn: 'root',
})
export class RtorrentTorrentsService {
  private static REFRESH_EVERY = 60 * 1000;
  private static _refreshIsRunning = false;

  API_URL = '/api/rtorrent/torrents';

  private readonly currentTorrentsSubject: Subject<RtorrentTorrent[]>;

  //noinspection JSUnusedLocalSymbols
  constructor(
    private readonly httpClient: HttpClient,
    private readonly _notificationService: NotificationService,
    private readonly logger: NGXLogger,
    private readonly _refreshService: RefreshService
  ) {
    this.currentTorrentsSubject = new ReplaySubject<RtorrentTorrent[]>();
  }

  private _refreshTorrents(noTimeout = false) {
    if (this.currentTorrentsSubject.observers.length > 0) {
      this._refreshService.setRefreshing(true);
      RtorrentTorrentsService._refreshIsRunning = true;
      this._loadTorrents()
        .then((torrents) => {
          RtorrentTorrentsService._refreshIsRunning = false;
          this.currentTorrentsSubject.next(torrents);
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshTorrents();
            }, RtorrentTorrentsService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(RtorrentTorrentsService.REFRESH_EVERY / 1000, () => this._forceRefreshTorrents());
          }
          this._refreshService.setRefreshing(false);
        })
        .catch(() => {
          RtorrentTorrentsService._refreshIsRunning = false;
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshTorrents();
            }, RtorrentTorrentsService.REFRESH_EVERY);
            this._refreshService.setRefreshingTimout(RtorrentTorrentsService.REFRESH_EVERY / 1000, () => this._forceRefreshTorrents());
          }
          this._refreshService.setRefreshing(false);
        });
    }
  }

  /**
   * force refreshing of file (without
   */
  private _forceRefreshTorrents() {
    this._refreshTorrents(true);
  }

  /**
   * Load the Torrents from backend
   */
  private _loadTorrents(): Promise<RtorrentTorrent[]> {
    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this.httpClient
        .get<ApiReturn>(this.API_URL)
        .toPromise()
        .then((data: ApiReturn) => {
          const value = data.data as RtorrentTorrent[];
          resolve(value);
        })
        .catch((error) => {
          this._notificationService.handleError(error);
          reject(error);
        });
    });
  }

  /**
   * Initialize the loading of torrents
   * @param forceRelaunch Should force the restarting (should be only useful for tests)
   */
  startLoadingTorrents(forceRelaunch = false) {
    // this.logger.debug('startLoadingStats ' + RtorrentTorrentsService._refreshIsRunning);

    if (forceRelaunch) {
      RtorrentTorrentsService._refreshIsRunning = false;
    }

    if (!RtorrentTorrentsService._refreshIsRunning) {
      this._refreshTorrents();
    }
  }

  /**
   * Subscribe to know change on this
   */
  currentTorrentsObservable(): Observable<RtorrentTorrent[]> {
    return this.currentTorrentsSubject;
  }

  /**
   * Pause a torrent in backend
   */
  pauseTorrent(hash: string) {
    this.httpClient
      .put<ApiReturn>(`${this.API_URL}/${hash}/pause`, {})
      .toPromise()
      .then((data: ApiReturn) => {
        const torrents = data.data as RtorrentTorrent[];
        this.currentTorrentsSubject.next(torrents);
      })
      .catch((error) => {
        this._notificationService.handleError(error);
      });
  }

  /**
   * Start a torrent in backend
   */
  startTorrent(hash: string) {
    this.httpClient
      .put<ApiReturn>(`${this.API_URL}/${hash}/start`, {})
      .toPromise()
      .then((data: ApiReturn) => {
        const torrents = data.data as RtorrentTorrent[];
        this.currentTorrentsSubject.next(torrents);
      })
      .catch((error) => {
        this._notificationService.handleError(error);
      });
  }

  /**
   * Remove a torrent in backend
   */
  removeTorrent(hash: string) {
    this.httpClient
      .delete<ApiReturn>(`${this.API_URL}/${hash}`, {})
      .toPromise()
      .then((data: ApiReturn) => {
        const torrents = data.data as RtorrentTorrent[];
        this.currentTorrentsSubject.next(torrents);
      })
      .catch((error) => {
        this._notificationService.handleError(error);
      });
  }

  /**
   * Add info to backend to download locally or not the torrent
   * @param hash
   * @param should
   */
  shouldGetFromSeeBox(hash: string, should: boolean) {
    this.httpClient
      .put<ApiReturn>(`${this.API_URL}/${hash}/shouldDownload/${should}`, {})
      .toPromise()
      .then((data: ApiReturn) => {
        const torrents = data.data as RtorrentTorrent[];
        this.currentTorrentsSubject.next(torrents);
      })
      .catch((error) => {
        this._notificationService.handleError(error);
      });
  }
}
