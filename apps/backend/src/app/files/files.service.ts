import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  FileMove,
  FilesFile,
  FilesStatus,
  MoveType,
} from '@seed-me-home/models';
import { ConfigService } from '@nestjs/config';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import * as fs from 'fs';
import * as path from 'path';

import * as mv from 'mv';
import * as disk from 'diskusage';

@Injectable()
export class FilesService {
  readonly logger = new Logger(FilesService.name);

  constructor(
    private _configService: ConfigService,
    private _ftpSeedService: FtpSeedService
  ) {}

  getStatus(): Promise<FilesStatus> {
    //noinspection JSUnusedLocalSymbols
    return new Promise<FilesStatus>((resolve) => {
      Promise.all([
        disk.check(this._ftpSeedService.getPathLocal()).catch((reason) => {
          this.logger.error(reason);
        }),
        disk.check(this._configService.get('PATH_NAS')).catch((reason) => {
          this.logger.error(
            `Not found ${path.resolve(this._configService.get('PATH_NAS'))}`
          );
          this.logger.error(reason);
        }),
      ]).then((infos) => {
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
    return this._getFiles(this._configService.get('PATH_DOWNLOAD'));
  }

  getFilesNas(): Promise<FilesFile> {
    return this._getFiles(this._configService.get('PATH_NAS'));
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
          return reject(
            new HttpException('File not found', HttpStatus.NOT_FOUND)
          );
        }

        //this.logger.debug(stats);

        const result: FilesFile = {
          downloadStarted: undefined,
          path: path.basename(filePath),
          fullpath: fs.realpathSync(filePath),
          size: stats.size,
          downloaded: stats.size,
          isDirectory: stats.isDirectory(),
          children: [],
          modifiedDate: stats.mtime,
        };

        if (!result.isDirectory) {
          const progress = this._ftpSeedService.getProgression(result.fullpath);
          if (progress) {
            //this.logger.debug(progress);
            result.size = +progress.size;
            result.downloaded = progress.value;
            result.downloadStarted = progress.downloadStarted;
          }
          //this.logger.debug(result);
          resolve(result);
        } else {
          result.size = 0;
          result.downloaded = 0;
          const promises = [];
          fs.readdirSync(filePath).forEach((child) => {
            //console.log(path.join(root, child));
            if (!child.startsWith('.')) {
              promises.push(
                this._getFiles(path.join(filePath, child), level + 1)
              );
            }
          });
          Promise.all(promises)
            .then((children) => {
              result.children = children;

              result.children.forEach((child) => {
                result.size += child.size;
                result.downloaded += child.downloaded;
                if (
                  !result.downloadStarted ||
                  (child.downloadStarted &&
                    child.downloadStarted.getTime() <
                      result.downloadStarted.getTime())
                ) {
                  result.downloadStarted = child.downloadStarted;
                }
              });
              //console.log(children);
              //this.logger.debug(result);
              resolve(result);
            })
            .catch((raison) => {
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
        return reject(
          new HttpException('File not found', HttpStatus.NOT_FOUND)
        );
      }
      //this.logger.debug(fullPath);

      // File in downloaded or Nas ?
      const isAuthorized = this._fileModificationAuthorized(fullPath);

      //this.logger.debug(isAuthorized);
      if (!isAuthorized) {
        return reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }

      // Delete it
      try {
        this._deleteFolderRecursive(fullPath);
        resolve();
      } catch (e) {
        this.logger.error('cannot remove ' + fullPath);
        this.logger.error(e);
        return reject(new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    });
  }

  private _deleteFolderRecursive(fullPath: string) {
    if (fs.existsSync(fullPath)) {
      if (fs.lstatSync(fullPath).isDirectory()) {
        // Directory : remove the content
        fs.readdirSync(fullPath).forEach((file) => {
          const curPath = path.join(fullPath, file);
          this._deleteFolderRecursive(curPath);
        });
        fs.rmdirSync(fullPath);
      } else {
        // File : simply remove it
        fs.unlinkSync(fullPath);
      }
    }
  }

  moveFile(fileMove: FileMove) {
    return new Promise<void>((resolve, reject) => {
      //this.logger.debug(fileMove);

      if (!fileMove) {
        return reject(new HttpException('Bad request', HttpStatus.BAD_REQUEST));
      }

      // Nas exist ?
      try {
        fs.realpathSync(this._configService.get('PATH_NAS'));
      } catch (e) {
        return reject(new HttpException('Nas not found', HttpStatus.NOT_FOUND));
      }

      // File exist ?
      try {
        fileMove.sourceFullPath = fs.realpathSync(fileMove.sourceFullPath);
      } catch (e) {
        return reject(
          new HttpException('File not found', HttpStatus.NOT_FOUND)
        );
      }
      //this.logger.debug(fileMove.sourceFullPath);

      const isAuthorized = this._fileModificationAuthorized(
        fileMove.sourceFullPath
      );
      //this.logger.debug(isAuthorized);
      if (!isAuthorized) {
        return reject(new HttpException('Forbidden', HttpStatus.FORBIDDEN));
      }

      // calculate target full path
      let fullPathTarget = path.join(
        this._configService.get('PATH_NAS'),
        this._configService.get('PATH_MOVIES'),
        fileMove.targetPath
      );
      if (fileMove.targetType === MoveType.series) {
        fullPathTarget = path.join(
          this._configService.get('PATH_NAS'),
          this._configService.get('PATH_SERIES'),
          fileMove.targetPath
        );
      }

      // modify target full path depending on case
      const dirs = [];
      let dir = path.dirname(fullPathTarget);
      while (dir.length !== 1) {
        dirs.push(dir);
        dir = path.dirname(dir);
      }
      let replaced = '';
      let replacer = '';
      let previousFound = true;
      dirs.reverse().forEach((d0) => {
        if (previousFound) {
          const d = d0.replace(replaced, replacer);
          if (!fs.existsSync(d)) {
            // search in parent (with no case)
            previousFound = false;
            fs.readdirSync(path.dirname(d)).forEach((f) => {
              if (
                path.join(path.dirname(d), f).toLowerCase() === d.toLowerCase()
              ) {
                previousFound = true;
                replaced = d0;
                replacer = path.join(path.dirname(d), f);
              }
            });
          }
        }
      });
      fullPathTarget = fullPathTarget.replace(replaced, replacer);

      // Move it
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      let mvDone = false;
      mv(
        fileMove.sourceFullPath,
        fullPathTarget,
        { mkdirp: true },
        function (err) {
          if (err) {
            that.logger.error(
              'cannot move "' +
                fileMove.sourceFullPath +
                '" to "' +
                fullPathTarget +
                '"'
            );
            that.logger.error(err);
            mvDone = true;
            return reject(
              new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
            );
          }
          if (!mvDone) {
            mvDone = true;
            resolve();
          }
        }
      );
      setTimeout(() => {
        if (!mvDone) {
          mvDone = true;
          resolve();
        }
      }, 2000);
    });
  }

  private _fileModificationAuthorized(fullPath: string): boolean {
    // File in downloaded or Nas ?
    let path_local, path_nas;
    try {
      path_local = fs.realpathSync(this._configService.get('PATH_DOWNLOAD'));
      // eslint-disable-next-line no-empty
    } catch (e) {}
    try {
      path_nas = fs.realpathSync(this._configService.get('PATH_NAS'));
      // eslint-disable-next-line no-empty
    } catch (e) {}

    //this.logger.debug(path_local);
    //this.logger.debug(path_nas);

    return (
      (path_local && fullPath && fullPath.startsWith(path_local)) ||
      (path_nas && fullPath && fullPath.startsWith(path_nas))
    );
  }
}
