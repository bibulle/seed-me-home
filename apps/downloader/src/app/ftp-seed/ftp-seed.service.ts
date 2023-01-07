/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { Progression } from '@seed-me-home/models';
import { ProgressionService } from '@seed-me-home/progression';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { dirname, join } from 'path';

@Injectable()
export class FtpSeedService {
  readonly logger = new Logger(FtpSeedService.name);

  private static downloadWaitingList: Progression[] = [];
  private static downloadCurrentList: string[] = [];
  private static readonly PARALLELED_DOWNLOAD_MAX = 4;

  // Client = require('ssh2');

  private _ftpConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    //debug: any
  } = null;

  private _pathFtp: string;
  private _pathDownload: string;

  constructor(private _configService: ConfigService, private progressionService: ProgressionService) {
    this.progressionService.init(this._configService.get('PATH_PROGRESS'), this._configService.get('SEEDBOX_FTP_PATH'), this._configService.get('PATH_DOWNLOAD'));
  }

  private _initialize() {
    //this.logger.debug('_initialize');
    if (!this._ftpConfig) {
      this._ftpConfig = {
        host: this._configService.get('SEEDBOX_FTP_HOST'),
        port: this._configService.get('SEEDBOX_FTP_PORT'),
        username: this._configService.get('SEEDBOX_FTP_USER'),
        password: this._configService.get('SEEDBOX_FTP_PASS'),
        //debug: (m) => { this.logger.debug(m)}
      };
      this._pathFtp = this._configService.get('SEEDBOX_FTP_PATH');
      this._pathDownload = this._configService.get('PATH_DOWNLOAD');
      this.logger.log('Download to : ' + this._pathDownload);
    }
  }

  @Interval(40 * 1000)
  intervalJob_FtpSeedService() {
    // this.logger.debug(`FtpSeedService interval ${FtpSeedService.downloadCurrentList.length} ${FtpSeedService.downloadWaitingList.length}`);
    const shouldDownload: Progression[] = [];

    // read all files
    this._initialize();

    const files = this.progressionService.getAll();
    files.forEach((file) => {
      const progress = this.progressionService.getProgression(file);
      if (!progress) {
        this.logger.warn('Cannot read progression for file : ' + file);
      } else {
        if (progress.shouldDownload && progress.progress !== 100) {
          // test if in currentDownload
          if (!FtpSeedService.downloadCurrentList.includes(progress.fullPath)) {
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
        return a.fullPath.localeCompare(b.fullPath);
      }
    });

    FtpSeedService.downloadWaitingList = shouldDownload;

    [...Array(FtpSeedService.PARALLELED_DOWNLOAD_MAX)].map(() => {
      this._startADownload();
    });

    // clean very old done files
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.progressionService.clearOldDoneFiles(yesterday);

    return false;
  }

  private _startADownload() {
    if (FtpSeedService.downloadCurrentList.length < FtpSeedService.PARALLELED_DOWNLOAD_MAX && FtpSeedService.downloadWaitingList.length !== 0) {
      const fullpath = FtpSeedService.downloadWaitingList[0].fullPath;

      FtpSeedService.downloadCurrentList.push(fullpath);
      FtpSeedService.downloadWaitingList.shift();

      this._downloadFile(fullpath)
        .then(() => {
          // this.logger.debug('_downloadFile then : ' + fullpath);
          for (let i = 0; i < FtpSeedService.downloadCurrentList.length; i++) {
            if (FtpSeedService.downloadCurrentList[i] === fullpath) {
              FtpSeedService.downloadCurrentList.splice(i, 1);
            }
          }
        })
        .catch((reason) => {
          this.logger.debug('_downloadFile catch : ' + fullpath);
          this.logger.error(reason);

          for (let i = 0; i < FtpSeedService.downloadCurrentList.length; i++) {
            if (FtpSeedService.downloadCurrentList[i] === fullpath) {
              FtpSeedService.downloadCurrentList.splice(i, 1);
            }
          }
        });
    }
  }

  _downloadFile(fullPath: string): Promise<void> {
    fullPath = this.progressionService.cleanFullFileName(fullPath);
    return new Promise<void>((collect, reject) => {
      this._initialize();

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;

      this.logger.log('Downloading : ' + fullPath);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Client } = require('ssh2');

      const conn = new Client();

      conn.on('ready', () => {
        //this.logger.debug('Client : ready');
        conn.sftp((err1, sftp) => {
          if (err1) {
            this.logger.error(err1);
            return reject(err1);
          }

          const fileSrc = join(that._pathFtp, fullPath);
          const fileTrg = join(that._pathDownload, fullPath);

          const paths = [dirname(fileTrg)];
          while (paths[0] !== '.' && paths[0] !== '/') {
            paths.unshift(dirname(paths[0]));
          }
          paths.forEach((p) => {
            if (!existsSync(p)) {
              mkdirSync(p);
            }
          });

          const downloadStarted = new Date();

          sftp.fastGet(
            fileSrc,
            fileTrg,
            {
              //concurrency: 1,
              debug: (msg) => {
                this.logger.debug(msg);
              },
              step: (total_transferred: number, chunk: number, total: number) => {
                const progress = that.progressionService.getProgression(fullPath);
                if (!progress.shouldDownload) {
                  this.logger.log('Asked to stop downloading : ' + fullPath);
                  that.progressionService.setProgression(fullPath, 0, total, undefined);
                  sftp.end();
                } else {
                  that.progressionService.setProgression(fullPath, total_transferred, total, downloadStarted);
                }
              },
            },
            (err2: Error) => {
              if (err2) {
                if (err2.message === 'No such file') {
                  err2.message = 'No such file : ' + fileSrc;
                }
                this.logger.error(err2.stack);
                return reject(err2);
              }
              conn.end();
            }
          );
        });
      });
      // conn.on('close', (hadErr) => {
      // this.logger.debug('close (' + hadErr + ')');
      // });
      conn.on('error', (err: Error) => {
        this.logger.error(err.stack);
        reject(err);
      });
      conn.on('end', () => {
        this.logger.debug('end');
        collect();
      });

      // connect
      if (this._configService.get('SEEDBOX_FTP_DISABLED') && ('' + this._configService.get('SEEDBOX_FTP_DISABLED')).toUpperCase() === 'TRUE') {
        this.logger.warn('SeedBox downloading disabled ');
        //        const progress = that.getProgression(fullPath);
        //        this.logger.debug(progress);
        //        if (progress) {
        //          that.setProgression(fullPath, progress.size*0.1, progress.size, new Date())
        //        }
        return collect();
      }
      conn.connect(this._ftpConfig);
    });
  }
}
