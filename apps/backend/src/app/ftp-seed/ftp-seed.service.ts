import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from '../../services/config/config.service';
import * as fs from 'fs';
import { Interval, NestSchedule } from 'nest-schedule';

@Injectable()
export class FtpSeedService extends NestSchedule {
  static readonly logger = new Logger(FtpSeedService.name);

  static readonly SIZE_LIMIT_DOWNLOAD = 5 * 1024 * 1024 * 1024;

  private static downloadWaitingList: Progression[] = [];
  private static downloadCurrentList: string[] = [];
  private static readonly PARALLELED_DOWNLOAD_MAX = 4;

  Client = require('ssh2');

  private _ftpConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    //debug: any
  } = null;

  private _pathFtp: string;
  private _pathDownload: string;
  private _pathProgress: string;

  constructor(private _configService: ConfigService) {
    super();
  }

  private _initialize() {
    //FtpSeedService.logger.debug('_initialize');
    if (!this._ftpConfig) {
      this._ftpConfig = {
        host: this._configService.getSeedboxFtpHost(),
        port: this._configService.getSeedboxFtpPort(),
        username: this._configService.getSeedboxFtpUser(),
        password: this._configService.getSeedboxFtpPass()
        //debug: (m) => { FtpSeedService.logger.debug(m)}
      };
      this._pathFtp = this._configService.getSeedboxFtpPath();
      this._pathDownload = path.join(this.getPathLocal(), this._configService.getPathDownload());
      this._pathProgress = path.join(this.getPathLocal(), this._configService.getPathProgress());
      FtpSeedService.logger.log('Download to : ' + this._pathDownload);
      FtpSeedService.logger.log('Save progress to : ' + this._pathProgress);

      if (!fs.existsSync(this._pathProgress)) {
        fs.mkdirSync(this._pathProgress);
      }
    }
  }

  getPathLocal() {
    return path.join(__dirname, '../../..');
  }

  getProgression(fullPath: string): Progression {
    this._initialize();
    fullPath = this._cleanFullFileName(fullPath);

    // FtpSeedService.logger.debug(path.resolve(fullPath));
    const fileTrg = this._getProgressionFileName(fullPath);
    // FtpSeedService.logger.debug(path.resolve(fileTrg));

    try {
      const data = fs.readFileSync(fileTrg, { encoding: 'utf8' });

      const progress = JSON.parse(data) as Progression;
      if (progress.downloadStarted) {
        progress.downloadStarted = new Date(progress.downloadStarted);
      }

      return progress;
    } catch (e) {
      return null;
    }
  }

  switchShouldDownload(fullPath: string, size: number, should: boolean) {
    fullPath = this._cleanFullFileName(fullPath);

    let data = this.getProgression(fullPath);
    if (!data) {
      this.setProgression(fullPath, 0, size, undefined);
      data = this.getProgression(fullPath);
    }

    data.shouldDownload = should;
    this._saveProgression(fullPath, data);
  }

  setProgression(fullPath: string, value: number, size: number, downloadStarted: Date) {
    this._initialize();

    const previous = this.getProgression(fullPath);

    const obj: Progression = {
      value: value,
      size: size,
      progress: Math.round((100 * value) / Math.max(1, size)),
      shouldDownload: previous ? previous.shouldDownload : size < FtpSeedService.SIZE_LIMIT_DOWNLOAD,
      fullPath: fullPath,
      downloadStarted: downloadStarted
    };

    this._saveProgression(fullPath, obj);
  }

  private _saveProgression(fullPath: string, data: Progression) {
    this._initialize();
    fullPath = this._cleanFullFileName(fullPath);

    const fileTrg = this._getProgressionFileName(fullPath);

    fs.writeFileSync(fileTrg, JSON.stringify(data), { flag: 'w', encoding: 'utf8' });
  }

  tellProgressionUseful(fullPath: string) {
    this._initialize();
    fullPath = this._cleanFullFileName(fullPath);

    const fileTrg = this._getProgressionFileName(fullPath);

    if (fs.existsSync(fileTrg)) {
      fs.writeFileSync(fileTrg, ' ', { flag: 'a', encoding: 'utf8' });
    }
  }

  clearOldDoneFiles(olderThan: Date) {
    this._initialize();

    let files = [];
    try {
      files = fs.readdirSync(this._pathProgress);
    } catch (e) {}

    files.forEach(file => {
      try {
        const modifiedTime = fs.statSync(path.join(this._pathProgress, file)).mtimeMs;

        if (modifiedTime < olderThan.getTime()) {
          fs.unlinkSync(path.join(this._pathProgress, file));
        }
      } catch (e) {
        FtpSeedService.logger.error(e.stack);
      }
    });
  }

  private _getProgressionFileName(fullPath: string): string {
    fullPath = this._cleanFullFileName(fullPath);

    // remove the .progress if needed
    fullPath = fullPath.replace(/[.]progress$/, '');

    return path.join(this._pathProgress, fullPath.replace(/[\\\/]/g, '_') + '.progress');
  }

  private _cleanFullFileName(fullPath: string): string {
    this._initialize();

    const regexp = new RegExp(
      '.*(' + this._configService.getSeedboxFtpPath() + '|' + this._configService.getPathDownload() + ')/'
    );

    return fullPath.replace(regexp, '');
  }

  @Interval(40 * 1000)
  intervalJob_FtpSeedService() {
    // FtpSeedService.logger.debug('intervalJob_FtpSeedService');
    const shouldDownload: Progression[] = [];

    // read all files
    this._initialize();

    const files = fs.readdirSync(this._pathProgress);
    files.forEach(file => {
      const progress = this.getProgression(file);
      if (!progress) {
        FtpSeedService.logger.warn('Cannot read progression for file : ' + file);
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
    this.clearOldDoneFiles(yesterday);

    return false;
  }

  private _startADownload() {
    if (
      FtpSeedService.downloadCurrentList.length < FtpSeedService.PARALLELED_DOWNLOAD_MAX &&
      FtpSeedService.downloadWaitingList.length !== 0
    ) {
      const fullpath = FtpSeedService.downloadWaitingList[0].fullPath;

      FtpSeedService.downloadCurrentList.push(fullpath);
      FtpSeedService.downloadWaitingList.shift();

      this._downloadFile(fullpath)
        .then(() => {
          FtpSeedService.logger.debug('_downloadFile then : ' + fullpath);
          for (let i = 0; i < FtpSeedService.downloadCurrentList.length; i++) {
            if (FtpSeedService.downloadCurrentList[i] === fullpath) {
              FtpSeedService.downloadCurrentList.splice(i, 1);
            }
          }
        })
        .catch(() => {
          FtpSeedService.logger.debug('_downloadFile catch : ' + fullpath);
          for (let i = 0; i < FtpSeedService.downloadCurrentList.length; i++) {
            if (FtpSeedService.downloadCurrentList[i] === fullpath) {
              FtpSeedService.downloadCurrentList.splice(i, 1);
            }
          }
        });
    }
  }

  _downloadFile(fullPath: string): Promise<void> {
    fullPath = this._cleanFullFileName(fullPath);
    return new Promise<void>((collect, reject) => {
      this._initialize();

      const that = this;

      FtpSeedService.logger.log('Downloading : ' + fullPath);

      const conn = new this.Client();

      conn.on('ready', () => {
        //FtpSeedService.logger.debug('Client : ready');
        conn.sftp((err1, sftp) => {
          if (err1) {
            FtpSeedService.logger.error(err1);
            return reject(err1);
          }

          const fileSrc = path.join(that._pathFtp, fullPath);
          const fileTrg = path.join(that._pathDownload, fullPath);

          const paths = [path.dirname(fileTrg)];
          while (paths[0] !== '.' && paths[0] !== '/') {
            paths.unshift(path.dirname(paths[0]));
          }
          paths.forEach(p => {
            if (!fs.existsSync(p)) {
              fs.mkdirSync(p);
            }
          });

          const downloadStarted = new Date();

          sftp.fastGet(
            fileSrc,
            fileTrg,
            {
              //concurrency: 1,
              debug: msg => {
                FtpSeedService.logger.debug(msg);
              },
              step: (total_transferred: number, chunk: number, total: number) => {
                const progress = that.getProgression(fullPath);
                if (!progress.shouldDownload) {
                  FtpSeedService.logger.log('Asked to stop downloading : ' + fullPath);
                  that.setProgression(fullPath, 0, total, undefined);
                  sftp.end();
                } else {
                  that.setProgression(fullPath, total_transferred, total, downloadStarted);
                }
              }
            },
            (err2: Error) => {
              if (err2) {
                if (err2.message === 'No such file') {
                  err2.message = 'No such file : ' + fileSrc;
                }
                FtpSeedService.logger.error(err2.stack);
                return reject(err2);
              }
              conn.end();
            }
          );
        });
      });
      conn.on('close', hadErr => {
        FtpSeedService.logger.debug('close (' + hadErr + ')');
      });
      conn.on('error', (err: Error) => {
        FtpSeedService.logger.error(err.stack);
        reject(err);
      });
      conn.on('end', () => {
        FtpSeedService.logger.debug('end');
        collect();
      });

      // connect
      if (this._configService.getSeedboxFtpDisabled()) {
        FtpSeedService.logger.warn('SeedBox downloading disabled ');
        //        const progress = that.getProgression(fullPath);
        //        FtpSeedService.logger.debug(progress);
        //        if (progress) {
        //          that.setProgression(fullPath, progress.size*0.1, progress.size, new Date())
        //        }
        return collect();
      }
      conn.connect(this._ftpConfig);
    });
  }
}

export class Progression {
  value: number;
  size: number;
  progress: number;
  shouldDownload: boolean;
  fullPath: string;
  downloadStarted: Date;
}
