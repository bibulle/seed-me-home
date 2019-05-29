import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FileMove, FilesFile, FilesStatus, MoveType } from '@seed-me-home/models';
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
          return reject(new HttpException('File not found', HttpStatus.NOT_FOUND));
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

  removeFile(fullPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //this.logger.debug(fullPath);

      // File exist ?
      try {
        fullPath = fs.realpathSync(fullPath);
      } catch (e) {
        return reject(new HttpException('File not found', HttpStatus.NOT_FOUND));
      }
      this.logger.debug(fullPath);

      // File in downloaded or Nas ?
      const isAuthorized = this._fileModificationAuthorized(fullPath);

      this.logger.debug(isAuthorized);
      if (!isAuthorized) {
        return reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }

      // Delete it
      try {
        fs.unlink(fullPath, err => {
          if (err) {
            this.logger.error('cannot remove ' + fullPath);
            this.logger.error(err);
            return reject(new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR));
          }
          resolve();
        });
      } catch (e) {
        this.logger.error('cannot remove ' + fullPath);
        this.logger.error(e);
        return reject(new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    });
  }

  moveFile(fileMove: FileMove) {
    return new Promise<void>((resolve, reject) => {
      //this.logger.debug(fileMove);

      if (!fileMove) {
        return reject(new HttpException('Bad request', HttpStatus.BAD_REQUEST));
      }

      // Nas exist ?
      try {
        fs.realpathSync(this._configService.getPathNas());
      } catch (e) {
        return reject(new HttpException('Nas not found', HttpStatus.NOT_FOUND));
      }

      // File exist ?
      try {
        fileMove.sourceFullPath = fs.realpathSync(fileMove.sourceFullPath);
      } catch (e) {
        return reject(new HttpException('File not found', HttpStatus.NOT_FOUND));
      }
      //this.logger.debug(fileMove.sourceFullPath);

      const isAuthorized = this._fileModificationAuthorized(fileMove.sourceFullPath);
      //this.logger.debug(isAuthorized);
      if (!isAuthorized) {
        return reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }

      // calculate target full path
      let fullPathTarget = path.join(
        this._configService.getPathNas(),
        this._configService.getPathMovies(),
        fileMove.targetPath
      );
      if (fileMove.targetType === MoveType.series) {
        fullPathTarget = path.join(
          this._configService.getPathNas(),
          this._configService.getPathSeries(),
          fileMove.targetPath
        );
      }

      //      fileMove.sourceFullPath= 'Game of Thrones S08E04.mkv';
      //      fullPathTarget = 'nAs/Series/Game of Thrones/Season 08/Game of Thrones S08E04.mkv';
      //      // modify target full path depending on case
      //      const dirs = [];
      //      let dir = path.dirname(fullPathTarget);
      //      while (dir.length !== 1) {
      //        dirs.push(dir);
      //        dir = path.dirname(dir);
      //      }
      //      dirs.reverse().forEach((d, i, a) => {
      //        this.logger.debug('->'+d);
      //        if (!fs.existsSync(d)) {
      //          this.logger.debug("not exists : "+path.dirname(d));
      //        } else {
      //          this.logger.debug('exists : '+d);
      //          this.logger.debug(fs.realpathSync(d));
      //        }
      //
      //      });
      //      this.logger.debug(dirs);

      // Move it
      try {
        //this.logger.debug(fullPathTarget);
        //this.logger.debug(path.dirname(fullPathTarget));
        fs.mkdirSync(path.dirname(fullPathTarget), { recursive: true });

        fs.rename(fileMove.sourceFullPath, fullPathTarget, err => {
          if (err) {
            this.logger.error('cannot move "' + fileMove.sourceFullPath + '" to "' + fullPathTarget + '"');
            this.logger.error(err);
            return reject(new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR));
          }
          resolve();
        });
      } catch (e) {
        this.logger.error('cannot move "' + fileMove.sourceFullPath + '" to "' + fullPathTarget + '"');
        this.logger.error(e);
        return reject(new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    });
  }

  private _fileModificationAuthorized(fullPath: string): boolean {
    // File in downloaded or Nas ?
    let path_local, path_nas;
    try {
      path_local = fs.realpathSync(
        path.join(this._ftpSeedService.getPathLocal(), this._configService.getPathDownload())
      );
    } catch (e) {}
    try {
      path_nas = fs.realpathSync(this._configService.getPathNas());
    } catch (e) {}

    //this.logger.debug(path_local);
    //this.logger.debug(path_nas);

    return (
      (path_local && fullPath && fullPath.startsWith(path_local)) ||
      (path_nas && fullPath && fullPath.startsWith(path_nas))
    );
  }
}
