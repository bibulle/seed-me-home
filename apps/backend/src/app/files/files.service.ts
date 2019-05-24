import { Injectable, Logger } from '@nestjs/common';
import { FilesFile, FilesStatus } from '@seed-me-home/models';
import { ConfigService } from '../../services/config/config.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import * as fs from 'fs';
import * as path from 'path';

const disk = require('diskusage');

@Injectable()
export class FilesService {
  readonly logger = new Logger(FilesService.name);

  constructor(private _configService: ConfigService, private _ftpSeedService: FtpSeedService) {}

  getStatus(): Promise<FilesStatus> {
    //noinspection JSUnusedLocalSymbols
    return new Promise<FilesStatus>((resolve, reject) => {
      Promise.all([
        disk.check(this._ftpSeedService.getPathLocal()).catch(reason => {
          this.logger.error(reason);
        }),
        disk.check(this._configService.getPathNas()).catch(reason => {
          this.logger.error(reason);
        })
      ]).then(infos => {
        const result = {} as FilesStatus;

        if (infos[0]) {
          result.free_disk_space_local = infos[0].free;
          result.total_disk_space_local = infos[0].total;
        }
        if (infos[1]) {
          result.free_disk_space_nas = infos[1].free;
          result.total_disk_space_nas = infos[1].total;
        }

        resolve(result);
      });
      //        .catch(reason => {
      //          this.logger.error(reason);
      //          reject(reason);
      //        })
    });
  }

  getFilesLocal(): Promise<FilesFile> {
    return this._getFiles(path.join(this._ftpSeedService.getPathLocal(), this._configService.getPathDownload()));
  }

  getFilesNas(): Promise<FilesFile> {
    return this._getFiles(this._configService.getPathNas());
  }

  private _getFiles(filePath: string, level = 0): Promise<FilesFile> {
    return new Promise<FilesFile>((resolve, reject) => {
      // if (level === 0) {
      //   this.logger.debug('_getFiles '+level+' '+filePath);
      // }
      if (level > 20) {
        reject('Too many levels');
      }
      fs.stat(filePath, (err, stats) => {
        if (err) {
          this.logger.error(err);
          return resolve({
            path: path.basename(filePath),
            fullpath: path.basename(filePath),
            size: 0,
            downloaded: 0,
            isDirectory: false,
            children: [],
            modifiedDate: null
          });
        }

        //this.logger.debug(stats);

        const result: FilesFile = {
          path: path.basename(filePath),
          fullpath: fs.realpathSync(filePath),
          size: stats.size,
          downloaded: stats.size,
          isDirectory: stats.isDirectory(),
          children: [],
          modifiedDate: stats.mtime
        };

        if (!result.isDirectory) {
          const progress = this._ftpSeedService.getProgression(result.fullpath);
          if (progress) {
            //this.logger.debug(progress);
            result.size = +progress.size;
            result.downloaded = progress.value;
          }
          //this.logger.debug(result);
          resolve(result);
        } else {
          result.size = 0;
          result.downloaded = 0;
          const promises = [];
          fs.readdirSync(filePath).forEach(child => {
            //console.log(path.join(root, child));
            promises.push(this._getFiles(path.join(filePath, child), level + 1));
          });
          Promise.all(promises)
            .then(children => {
              result.children = children;

              result.children.forEach(child => {
                result.size += child.size;
                result.downloaded += child.downloaded;
              });
              //console.log(children);
              //this.logger.debug(result);
              resolve(result);
            })
            .catch(raison => {
              reject(raison);
            });
        }
      });
    });
  }
}
