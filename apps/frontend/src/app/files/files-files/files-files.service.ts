import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ApiReturn, FileMove, FilesFile, MoveType } from '@seed-me-home/models';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../notification/notification.service';
import { NGXLogger } from 'ngx-logger';
import { String } from 'typescript-string-operations';

@Injectable({
  providedIn: 'root',
})
export class FilesFilesService {
  private static REFRESH_EVERY = 21 * 1000;
  private static _refreshIsRunning = false;

  API_URL_LOCAL = '/api/files_api/local';
  API_URL_NAS = '/api/files_api/nas';
  API_URL_REMOVE = '/api/files_api/remove';
  API_URL_MOVE = '/api/files_api/move';

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

  private _refreshFiles(noTimeout = false) {
    if (
      this.currentFilesSubjectLocal.observers.length +
        this.currentFilesSubjectNas.observers.length >
      0
    ) {
      FilesFilesService._refreshIsRunning = true;
      this._loadFiles()
        .then((filesTable) => {
          FilesFilesService._refreshIsRunning = false;
          //this.logger.debug(filesTable[0]);
          this.currentFilesSubjectLocal.next(filesTable[0]);
          this.currentFilesSubjectNas.next(filesTable[1]);
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshFiles();
            }, FilesFilesService.REFRESH_EVERY);
          }
        })
        .catch(() => {
          FilesFilesService._refreshIsRunning = false;
          if (!noTimeout) {
            setTimeout(() => {
              this._refreshFiles();
            }, FilesFilesService.REFRESH_EVERY);
          }
        });
    }
  }

  /**
   * force refreshing of file (without
   */
  private _forceRefreshFiles() {
    this._refreshFiles(true);
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
          .catch((error) => {
            //console.log(error);
            if (
              error &&
              error.error &&
              error.error.message === 'File not found'
            ) {
              error.error = new ErrorEvent('HTTP_ERROR', {
                error: new Error('Http error'),
                message: 'Local not found',
              });
            }
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
          .catch((error) => {
            if (
              error &&
              error.error &&
              error.error.message === 'File not found'
            ) {
              error.error = new ErrorEvent('HTTP_ERROR', {
                error: new Error('Http error'),
                message: 'Nas not found',
              });
            }
            this._notificationService.handleError(error);
            reject(error);
          });
      }),
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

  removeFile(fullpath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.httpClient
        .post(this.API_URL_REMOVE, { fullpath: fullpath })
        .toPromise()
        .then(() => {
          //this.logger.debug('removeFile OK');
          resolve();
        })
        .catch((error) => {
          //this.logger.debug('removeFile KO');
          this._notificationService.handleError(error);
          reject(error);
        });
    });
  }

  moveFile(result: FileMove): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.httpClient
        .post(this.API_URL_MOVE, result)
        .toPromise()
        .then(() => {
          //this.logger.debug('moveFile OK');
          this._forceRefreshFiles();
          resolve();
        })
        .catch((error) => {
          //this.logger.debug('moveFile KO');
          this._notificationService.handleError(error);
          reject(error);
        });
    });
  }

  calculateTrgPath(sourcePath: string, sourceFullPath: string): FileMove {
    const ret: FileMove = {
      sourcePath: sourcePath,
      sourceFullPath: sourceFullPath,
      targetPath: sourcePath,
      targetType: MoveType.movies,
    };

    // test if series
    const series_matcher = [
      /(.+)[ .]+[s]([0-9]+)[e]([0-9]+)[ -.]*(.*)[.]([^.]*)/i,
      /(.+)[ .]+([0-9]+)[-.x]([0-9]+)[ -.]*(.*)[.]([^.]*)/i,
    ];

    const tv_shows_format =
      '${seriesName}/Season ${seasonNum1}/${seriesName} S${seasonNum}E${episodeNum}${episodeName}.${extension}';

    const file_cleaner = [
      'Repack',
      'Multi',
      'BDrip',
      'DVDrip',
      'HDRip',
      'WEBRip',
      'VDRip',
      'Xvid',
      'AC-3-UTT',
      '[-]*UTT[-]*',
      '[-]*LECHTI[-]*',
      'TrueFrench',
      'VOSTFR',
      'MAGNET',
      'HDTV',
      'PTN',
      'PROPER',
      'SSL',
      '[-]*GKS',
      '[-]RAW',
      '[-]PROTEiGON',
      '[-]F4ST',
      'x264',
      'H.264',
      'BluRay',
      'TDPG',
      'FTMVHD',
      'FRENCH',
      'PDTV',
      '-2T',
      '[-]FiXi0N',
      'CCS3',
      'ATeam',
      'ViGi',
      'NSP',
      'SN2P',
      'AMZN',
      'ARK01',
      'HEVC',
      'x265',
      'AAC',
      'AC3',
      'HVS',
      'DD5.1',
      'AAC5.1',
      '1080p',
      '720p',
      'WEB-DL',
      'HDLight',
      'SEEHD',
    ];

    file_cleaner.forEach((str) => {
      const regexp = new RegExp(`[ .-]*${str}([ .-]*)`, 'i');
      ret.targetPath = ret.targetPath.replace(regexp, '$1');
    });

    while (ret.targetPath.match(/[.]([^.]*[.][^.]+$)/)) {
      ret.targetPath = ret.targetPath.replace(/[.]([^.]*[.][^.]+$)/, ' $1');
    }
    ret.targetPath = ret.targetPath.replace(
      / ([0-9][0-9][0-9][0-9])([.][^.]+$)/,
      ' ($1)$2'
    );

    series_matcher.forEach((matcher) => {
      if (ret.targetPath.match(matcher)) {
        const seriesName = matcher.exec(ret.targetPath)[1];
        const seasonNum = matcher.exec(ret.targetPath)[2];
        const episodeNum = matcher.exec(ret.targetPath)[3];
        const episodeName = matcher.exec(ret.targetPath)[4];
        const extension = matcher.exec(ret.targetPath)[5];

        ret.targetPath = tv_shows_format
          .replace(/[$]{seriesName}/gi, seriesName)
          .replace(/[$]{seasonNum1}/gi, String.Format('{0:0}', seasonNum))
          .replace(/[$]{seasonNum}/gi, String.Format('{0:00}', seasonNum))
          .replace(/[$]{episodeNum}/gi, String.Format('{0:00}', episodeNum))
          .replace(/[$]{episodeName}/gi, episodeName ? ' ' + episodeName : '')
          .replace(/[$]{extension}/gi, extension);

        ret.targetType = MoveType.series;
      }
    });

    return ret;
  }
}
