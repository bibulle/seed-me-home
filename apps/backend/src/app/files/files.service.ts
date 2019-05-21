import { Injectable, Logger } from '@nestjs/common';
import { FilesStatus } from '@seed-me-home/models';
import { ConfigService } from '../../services/config/config.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';

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
}
