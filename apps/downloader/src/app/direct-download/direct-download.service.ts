import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { Progression, ProgressionType } from '@seed-me-home/models';
import { ProgressionService } from '@seed-me-home/progression';
import { copyFile, copyFileSync, renameSync, statSync, unlink, unlinkSync } from 'fs';
import { join } from 'path';
import { Uptobox, UptoboxApi } from 'uptobox-ts';

@Injectable()
export class DirectDownloadService {
  readonly logger = new Logger(DirectDownloadService.name);

  private static downloadWaitingList: Progression[] = [];
  private static downloadCurrentList: string[] = [];
  private static readonly PARALLELED_DOWNLOAD_MAX = 4;

  private uptoboxToken: string;
  private pathDownload: string;

  constructor(private _configService: ConfigService, private progressionService: ProgressionService) {
    this.progressionService.init(this._configService.get('PATH_PROGRESS'), this._configService.get('SEEDBOX_FTP_PATH'), this._configService.get('PATH_DOWNLOAD'));
  }

  private _initialize() {
    //this.logger.debug('_initialize');
    if (!this.uptoboxToken) {
      this.uptoboxToken = this._configService.get('UPTOBOX_TOKEN');
      this.pathDownload = this._configService.get('PATH_DOWNLOAD');
    }
  }

  @Interval(40 * 1000)
  async intervalJob() {
    // this.logger.debug(`DirectDownloadService interval ${DirectDownloadService.downloadCurrentList.length} ${DirectDownloadService.downloadWaitingList.length}`);
    let shouldDownload: Progression[] = [];

    // read all files
    this._initialize();

    const files = this.progressionService.getAll();
    files.forEach((file) => {
      const progress = this.progressionService.getProgressionFromPath(file);
      if (!progress) {
        this.logger.warn('Cannot read progression for file : ' + file);
      } else if (progress.type === ProgressionType.DIRECT) {
        if (progress.shouldDownload && progress.progress !== 100) {
          // test if in currentDownload
          if (!DirectDownloadService.downloadCurrentList.includes(progress.url)) {
            shouldDownload.push(progress);
          }
        }
      }
    });

    // sort by progress (already started first) and then by path
    shouldDownload.sort((a, b) => {
      const ret = b.progress - a.progress;
      if (ret !== 0) {
        return ret;
      } else {
        const nameA = a.fullPath ? a.fullPath : a.url;
        const nameB = b.fullPath ? b.fullPath : b.url;
        return nameA.localeCompare(nameB);
      }
    });

    shouldDownload = await Promise.all(
      shouldDownload.map(async (p) => {
        const fileCode = new URL(p.url).pathname.slice(1);

        await UptoboxApi.getFilesInfo(fileCode).then((info) => {
          if (!info[0].fileName) {
            this.progressionService.switchShouldDownload(p.type, p.url, p.size, false);
          } else if (p.size !== info[0].fileSize || p.name !== info[0].fileName) {
            this.progressionService.setProgression(p.type, p.url, p.value, info[0].fileSize, p.downloadStarted, info[0].fileName);
          }
        });

        if (p.name) {
          let stats = statSync(p.name, { throwIfNoEntry: false });
          if (!stats) {
            stats = statSync(join(this.pathDownload, p.name), { throwIfNoEntry: false });
          }
          if (stats && stats.size && stats.size !== p.value) {
            this.progressionService.setProgression(p.type, p.url, stats.size, p.size, p.downloadStarted, p.name);
          }
        }

        return this.progressionService.getProgressionFromUrl(new URL(p.url));
      })
    );
    DirectDownloadService.downloadWaitingList = shouldDownload;

    [...Array(DirectDownloadService.PARALLELED_DOWNLOAD_MAX)].map(() => {
      this._startADownload();
    });

    // clean very old done files
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.progressionService.clearOldDoneFiles(yesterday);

    return false;
  }

  private _startADownload() {
    if (DirectDownloadService.downloadCurrentList.length < DirectDownloadService.PARALLELED_DOWNLOAD_MAX && DirectDownloadService.downloadWaitingList.length !== 0) {
      const progression = DirectDownloadService.downloadWaitingList[0];

      DirectDownloadService.downloadCurrentList.push(progression.url);
      DirectDownloadService.downloadWaitingList.shift();

      this._downloadFile(progression)
        .then(() => {
          // this.logger.debug('_downloadFile then : ' + progression.url);
          for (let i = 0; i < DirectDownloadService.downloadCurrentList.length; i++) {
            if (DirectDownloadService.downloadCurrentList[i] === progression.url) {
              DirectDownloadService.downloadCurrentList.splice(i, 1);
            }
          }
        })
        .catch((reason) => {
          // this.logger.debug('_downloadFile catch : ' + progression.url);
          this.logger.error(reason);

          for (let i = 0; i < DirectDownloadService.downloadCurrentList.length; i++) {
            if (DirectDownloadService.downloadCurrentList[i] === progression.url) {
              DirectDownloadService.downloadCurrentList.splice(i, 1);
            }
          }
        });
    }
  }

  _downloadFile(progression: Progression): Promise<void> {
    this.logger.debug(`Downloading '${progression.url}'`);
    return new Promise<void>((resolve, reject) => {
      this._initialize();

      if (!this.uptoboxToken) {
        return reject('Uptobox TOKEN must be defined');
      }

      Uptobox.setToken(this.uptoboxToken); // User token provided by Uptobox

      // Will download the file (premium or non-premium) in the current folder
      Uptobox.downloadFile(progression.url)
        .then((mess) => {
          this.logger.debug(`${progression.url} => ${mess}`);

          if (mess === 'File saved') {
            copyFile(progression.name, join(this.pathDownload, progression.name), (err) => {
              if (err) {
                reject(err);
              } else {
                unlink(progression.name, (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }
            });
          } else {
            reject(mess);
          }
        })
        .catch((reason) => {
          this.logger.error(reason);
          reject(reason);
        });
    });
  }
}
