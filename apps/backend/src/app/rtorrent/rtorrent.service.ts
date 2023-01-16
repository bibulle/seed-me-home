import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { ProgressionType, RTorrentFile, RtorrentStatus, RtorrentTorrent } from '@seed-me-home/models';
import { ProgressionService } from '@seed-me-home/progression';
import * as disk from 'diskusage';
import * as _ from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Rtorrent = require('@electorrent/node-rtorrent');

@Injectable()
export class RtorrentService {
  readonly logger = new Logger(RtorrentService.name);

  private _rtorrent;

  constructor(private _configService: ConfigService, private progressionService: ProgressionService) {
    this.progressionService.init(this._configService.get('PATH_PROGRESS'), this._configService.get('SEEDBOX_FTP_PATH'), this._configService.get('PATH_DOWNLOAD'));
  }

  private _initialize() {
    if (!this._rtorrent) {
      this._rtorrent = new Rtorrent({
        mode: this._configService.get('SEEDBOX_MODE'),
        host: this._configService.get('SEEDBOX_HOST'),
        port: this._configService.get('SEEDBOX_PORT'),
        path: this._configService.get('SEEDBOX_PATH'),
        user: this._configService.get('SEEDBOX_USER'),
        pass: this._configService.get('SEEDBOX_PASS'),
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forceRtorrentForMocking(mockRtorrent: any) {
    this._rtorrent = mockRtorrent;
  }

  getGlobals(callback: (err, status) => void) {
    this._initialize();
    this._rtorrent.getGlobals((err, status) => {
      if (status) {
        status = _.pick(status, ['down_rate', 'down_total', 'up_rate', 'up_total']);
      }

      //if (err) {
      //  console.log(err);
      //}

      callback(err, status);
    });
  }

  getStatus(): Promise<RtorrentStatus> {
    this._initialize();
    return new Promise<RtorrentStatus>((resolve, reject) => {
      Promise.all([
        // get torrent status
        new Promise<RtorrentStatus>((resolve1, reject1) => {
          this._getAll((err, status) => {
            if (err) {
              //this.logger.debug(err);
              reject1(err);
            } else {
              if (status) {
                status = _.pick(status, ['down_rate', 'down_total', 'up_rate', 'up_total', 'free_disk_space']);
              }
              resolve1(status);
            }
          });
        }),
        // get local disk status
        disk.check(this.progressionService.getPathLocal()).catch((reason) => {
          this.logger.error(reason);
        }),
      ])
        .then((result) => {
          // merge both
          const status: RtorrentStatus = result[0] as unknown as RtorrentStatus;

          if (result[1]) {
            status.free_disk_space_local = result[1].free;
          }
          resolve(status);
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  getTorrents(): Promise<RtorrentTorrent[]> {
    this._initialize();
    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this._getAll((err, all) => {
        if (err) {
          reject(err);
        } else {
          let torrents: RtorrentTorrent[];
          if (all) {
            //this.logger.debug(all);
            torrents = _.map(
              all.torrents,
              _.partialRight(_.pick, [
                'hash',
                'path',
                'name',
                'size',
                'completed',
                'down_rate',
                'down_total',
                'up_rate',
                'up_total',
                'createdAt',
                'complete',
                'addtime',
                'files',
                'ratio',
                'leechers',
                'seeders',
                'active',
                'open',
              ])
            ) as RtorrentTorrent[];

            // add download progression to files
            torrents.forEach((torrent) => {
              //this.logger.debug(torrent.active+' '+torrent.complete+' '+torrent.open+' '+torrent.name);
              let total_downloaded = 0;
              let total_shouldDownload = false;
              let total_downloadStarted: Date;
              torrent.files.forEach((file) => {
                const progress = this.progressionService.getProgressionFromPath(file.fullpath);
                if (progress) {
                  file.shouldDownload = progress.shouldDownload;
                  file.downloaded = progress.value;
                  file.downloadStarted = progress.downloadStarted;
                  total_downloaded += progress.value;
                  total_shouldDownload = total_shouldDownload || progress.shouldDownload;
                  if (!total_downloadStarted || (file.downloadStarted && file.downloadStarted.getTime() < total_downloadStarted.getTime())) {
                    total_downloadStarted = file.downloadStarted;
                  }
                } else {
                  file.downloaded = 0;
                  if (file['completed_chunks'] === file['chunks']) {
                    this.progressionService.setProgression(ProgressionType.TORRENT, file.fullpath, 0, file.size, undefined);
                  }
                }
                this.progressionService.tellProgressionUseful(file.fullpath);
              });

              torrent.downloaded = total_downloaded;
              torrent.shouldDownload = total_shouldDownload;
              //noinspection JSUnusedAssignment
              torrent.downloadStarted = total_downloadStarted;
            });
          }

          resolve(torrents);
        }
      });
    });
  }

  private _getAll(callback: (err, status) => void) {
    this._initialize();
    try {
      // this.logger.debug('_getAll before getAll');
      this._rtorrent.getAll((err, status) => {
        // this.logger.debug('_getAll in callback');
        callback(err, status);
      });
    } catch (e) {
      // this.logger.debug('_getAll in catch');
      this.logger.error(e);
      callback(e, null);
    }
  }

  getTorrentFiles(hash: string, callback: (err, files) => void) {
    this._initialize();
    this._rtorrent.getTorrentFiles(hash, (err, files) => {
      callback(err, files);
    });
  }

  pauseTorrent(hash: string): Promise<RtorrentTorrent[]> {
    //this.logger.debug('pauseTorrent');
    this._initialize();
    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this._rtorrent.pause([hash], (err) => {
        if (err) {
          return reject(err);
        }
        this.getTorrents()
          .then((torrents) => {
            resolve(torrents);
          })
          .catch((err1) => {
            reject(err1);
          });
      });
    });
  }

  startTorrent(hash: string): Promise<RtorrentTorrent[]> {
    this._initialize();
    //this.logger.debug('startTorrent');
    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this._rtorrent.stop([hash], (err1) => {
        if (err1) {
          return reject(err1);
        }
        this._rtorrent.start([hash], (err3) => {
          if (err3) {
            return reject(err3);
          }
          this.getTorrents()
            .then((torrents) => {
              resolve(torrents);
            })
            .catch((err2) => {
              reject(err2);
            });
        });
      });
    });
  }

  removeTorrent(hash: string): Promise<RtorrentTorrent[]> {
    this._initialize();
    //this.logger.debug('removeTorrent');
    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this._rtorrent.removeAndErase([hash], (err1) => {
        if (err1) {
          return reject(err1);
        }
        this.getTorrents()
          .then((torrents) => {
            resolve(torrents);
          })
          .catch((err2) => {
            reject(err2);
          });
      });
    });
  }

  switchShouldDownload(hash: string, should: boolean) {
    //this.logger.debug('shouldDownload ' + hash+' '+should);
    this._initialize();

    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this.getTorrentFiles(hash, (err1, files: RTorrentFile[]) => {
        if (err1) {
          return reject(err1);
        }

        files.forEach((f) => {
          this.progressionService.switchShouldDownload(ProgressionType.TORRENT, f.fullpath, f.size, should);
        });
        //this.logger.debug(files);
        this.getTorrents()
          .then((torrents) => {
            resolve(torrents);
          })
          .catch((err2) => {
            reject(err2);
          });
      });
    });
  }

  //  getTorrentsExtra (callback: (err, status) => void) {
  //    this._initialize();
  //    this._rtorrent.getTorrentsExtra(callback);
  //  }

  //  getTorrents (callback: (err, status) => void) {
  //    this._initialize();
  //    this._rtorrent.getTorrents(callback);
  //  }

  //  getTorrentTrackers (callback: (err, status) => void) {
  //    this._initialize();
  //    this._rtorrent.getTorrentTrackers(callback);
  //  }

  //  getTorrentPeers (callback: (err, status) => void) {
  //    this._initialize();
  //    this._rtorrent.getTorrentPeers(callback);
  //  }

  @Interval(60 * 1000)
  intervalJob_RtorrentService() {
    // this.logger.debug('intervalJob_RtorrentService');

    this.getTorrents().catch((err) => {
      this.logger.error('getTorrents error');
      this.logger.error(err);
    });

    return false;
  }
}
