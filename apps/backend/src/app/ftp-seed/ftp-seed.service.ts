import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from '../../services/config/config.service';
import * as fs from 'fs';

@Injectable()
export class FtpSeedService {
  static readonly logger = new Logger(FtpSeedService.name);

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

  constructor(private _configService: ConfigService) {}

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
      this._pathDownload = this._configService.getPathDownload();
      this._pathProgress = this._configService.getPathProgress();

      if (!fs.existsSync(this._pathProgress)) {
        fs.mkdirSync(this._pathProgress);
      }
    }
  }

  downloadFile(filePath: string): Promise<void> {
    return new Promise<void>((collect, reject) => {
      this._initialize();

      const that = this;

      const conn = new this.Client();

      conn.on('ready', () => {
        //FtpSeedService.logger.debug('Client : ready');
        conn.sftp((err1, sftp) => {
          if (err1) {
            FtpSeedService.logger.error(err1);
            return reject(err1);
          }

          const fileSrc = path.join(that._pathFtp, filePath);
          const fileTrg = path.join(that._pathDownload, filePath);

          const paths = [path.dirname(fileTrg)];
          while (paths[0] !== '.') {
            paths.unshift(path.dirname(paths[0]));
          }
          paths.forEach(p => {
            if (!fs.existsSync(p)) {
              fs.mkdirSync(p);
            }
          });

          sftp.fastGet(
            fileSrc,
            fileTrg,
            {
              step: (total_transferred: number, chunk: number, total: number) => {
                //FtpSeedService.logger.debug(filePath+' '+total_transferred + ' ' + chunk + ' ' + total);
                that._setProgression(filePath, total_transferred, total);
                //FtpSeedService.logger.debug(that.getProgression(filePath));
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
      //      conn.on('close', (hadErr) => {
      //        //FtpSeedService.logger.debug('close (' + hadErr + ')');
      //      });
      conn.on('error', (err: Error) => {
        FtpSeedService.logger.error(err.stack);
        reject(err);
      });
      conn.on('end', () => {
        //FtpSeedService.logger.debug('end');
        collect();
      });

      // connect
      conn.connect(this._ftpConfig);
    });
  }

  getProgression(filePath: string): Progression {
    this._initialize();
    const fileTrg = this._getProgressionFileName(filePath);
    //FtpSeedService.logger.debug(path.resolve(fileTrg));

    try {
      const data = fs.readFileSync(fileTrg, { encoding: 'utf8' });
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  private _setProgression(filePath: string, value: number, size: number) {
    this._initialize();
    const fileTrg = this._getProgressionFileName(filePath);

    const obj = {
      value: value,
      size: size,
      progress: Math.round((100 * value) / Math.max(1, size))
    };

    fs.writeFileSync(fileTrg, JSON.stringify(obj), { flag: 'w', encoding: 'utf8' });
  }

  tellProgressionUseful(filePath: string) {
    this._initialize();
    const fileTrg = this._getProgressionFileName(filePath);

    if (fs.existsSync(fileTrg)) {
      fs.writeFileSync(fileTrg, ' ', { flag: 'a', encoding: 'utf8' });
    }
  }

  clearOldDoneFiles(olderThan: Date) {
    this._initialize();

    const files = fs.readdirSync(this._pathProgress);

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

  private _getProgressionFileName(filePath: string) {
    return path.join(this._pathProgress, filePath.replace(/[\\\/]/g, '_') + '.progress');
  }
}

export class Progression {
  value: number;
  size: number;
  progress: number;
}
