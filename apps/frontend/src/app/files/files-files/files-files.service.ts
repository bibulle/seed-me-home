import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ApiReturn, FilesFile } from '@seed-me-home/models';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../notification/notification.service';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class FilesFilesService {
  private static REFRESH_EVERY = 21 * 1000;
  private static _refreshIsRunning = false;

  API_URL_LOCAL = environment.serverUrl + 'files/local';
  API_URL_NAS = environment.serverUrl + 'files/nas';

  private readonly currentFilesSubjectLocal: Subject<FilesFile>;
  private readonly currentFilesSubjectNas: Subject<FilesFile>;

  //noinspection JSUnusedLocalSymbols
  constructor(
    private readonly httpClient: HttpClient,
    private readonly _notificationService: NotificationService,
    private readonly logger: NGXLogger
  ) {
    this.currentFilesSubjectLocal = new ReplaySubject<FilesFile>();
    this.currentFilesSubjectNas = new ReplaySubject<FilesFile>();
  }

  private _refreshFiles() {
    if (this.currentFilesSubjectLocal.observers.length + this.currentFilesSubjectNas.observers.length > 0) {
      FilesFilesService._refreshIsRunning = true;
      this._loadFiles()
        .then(filesTable => {
          FilesFilesService._refreshIsRunning = false;
          //this.logger.debug(filesTable[0]);
          this.currentFilesSubjectLocal.next(filesTable[0]);
          this.currentFilesSubjectNas.next(filesTable[1]);
          setTimeout(() => {
            this._refreshFiles();
          }, FilesFilesService.REFRESH_EVERY);
        })
        .catch(() => {
          FilesFilesService._refreshIsRunning = false;
          setTimeout(() => {
            this._refreshFiles();
          }, FilesFilesService.REFRESH_EVERY);
        });
    }
  }

  /**
   * Load the files from backend
   */
  private _loadFiles(): Promise<FilesFile[]> {
    return Promise.all([
      new Promise<FilesFile>((resolve, reject) => {
        this.httpClient
          .get<ApiReturn>(this.API_URL_LOCAL)
          .toPromise()
          .then((data: ApiReturn) => {
            //this.logger.debug(data);
            const value = data.data as FilesFile;
            resolve(value);
          })
          .catch(error => {
            this._notificationService.handleError(error);
            reject(error);
          });
      }),
      new Promise<FilesFile>((resolve, reject) => {
        this.httpClient
          .get<ApiReturn>(this.API_URL_NAS)
          .toPromise()
          .then((data: ApiReturn) => {
            //this.logger.debug(data);
            const value = data.data as FilesFile;
            resolve(value);
          })
          .catch(error => {
            this._notificationService.handleError(error);
            reject(error);
          });
      })
    ]);
  }

  /**
   * Initialize the loading of stats
   * @param forceRelaunch Should force the restarting (should be only useful for tests)
   */
  startLoadingStats(forceRelaunch = false) {
    // this.logger.debug('startLoadingStats ' + RtorrentTorrentsService._refreshIsRunning);

    if (forceRelaunch) {
      FilesFilesService._refreshIsRunning = false;
    }

    if (!FilesFilesService._refreshIsRunning) {
      this._refreshFiles();
    }
  }

  /**
   * Subscribe to know change on this
   */
  currentFilesObservableLocal(): Observable<FilesFile> {
    return this.currentFilesSubjectLocal;
  }
  currentFilesObservableNas(): Observable<FilesFile> {
    return this.currentFilesSubjectNas;
  }
}
