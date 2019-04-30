import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../services/config/config.service';
import * as _ from 'lodash';
import { RTorrentFile, RtorrentStatus, RtorrentTorrent } from '@seed-me-home/models';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';

const Rtorrent = require('@electorrent/node-rtorrent');

@Injectable()
export class RtorrentService {
  readonly logger = new Logger(RtorrentService.name);

  private _rtorrent;

  constructor(private _configService: ConfigService, private _ftpSeedService: FtpSeedService) {}

  private _initialize() {
    if (!this._rtorrent) {
      this._rtorrent = new Rtorrent({
        mode: this._configService.getSeedboxMode(),
        host: this._configService.getSeedboxHost(),
        port: this._configService.getSeedboxPort(),
        path: this._configService.getSeedboxPath(),
        user: this._configService.getSeedboxUser(),
        pass: this._configService.getSeedboxPass()
      });
    }
  }

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
      this._getAll((err, status) => {
        if (err) {
          reject(err);
        } else {
          if (status) {
            status = _.pick(status, ['down_rate', 'down_total', 'up_rate', 'up_total', 'free_disk_space']);
          }
          resolve(status);
        }
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
                'open'
              ])
            );

            // add download progression to files
            torrents.forEach(torrent => {
              //this.logger.debug(torrent.active+' '+torrent.complete+' '+torrent.open+' '+torrent.name);
              let total_downloaded = 0;
              let total_shouldDownload = false;
              torrent.files.forEach(file => {
                const progress = this._ftpSeedService.getProgression(file.fullpath);
                if (progress) {
                  file.shouldDownload = progress.shouldDownload;
                  file.downloaded = progress.value;
                  total_downloaded += progress.value;
                  total_shouldDownload = total_shouldDownload || progress.shouldDownload;
                } else {
                  file.downloaded = 0;
                }
              });

              torrent.downloaded = total_downloaded;
              torrent.shouldDownload = total_shouldDownload;
              //              if (torrent.name.startsWith('Game.of.Thrones.S08E03')) {
              //                this.logger.debug(torrent);
              //              }
              //              if (torrent.name.startsWith('La Symphonie')) {
              //                this.logger.debug(torrent);
              //              }
            });
          }

          resolve(torrents);
        }
      });
    });
  }

  private _getAll(callback: (err, status) => void) {
    this._initialize();
    this._rtorrent.getAll((err, status) => {
      callback(err, status);
    });
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
      this._rtorrent.pause([hash], err => {
        if (err) {
          return reject(err);
        }
        this.getTorrents()
          .then(torrents => {
            resolve(torrents);
          })
          .catch(err1 => {
            reject(err1);
          });
      });
    });
  }

  startTorrent(hash: string): Promise<RtorrentTorrent[]> {
    this._initialize();
    //this.logger.debug('startTorrent');
    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this._rtorrent.stop([hash], err1 => {
        if (err1) {
          return reject(err1);
        }
        this._rtorrent.start([hash], err3 => {
          if (err3) {
            return reject(err3);
          }
          this.getTorrents()
            .then(torrents => {
              resolve(torrents);
            })
            .catch(err2 => {
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
      this._rtorrent.removeAndErase([hash], err1 => {
        if (err1) {
          return reject(err1);
        }
        this.getTorrents()
          .then(torrents => {
            resolve(torrents);
          })
          .catch(err2 => {
            reject(err2);
          });
      });
    });
  }

  shouldDownload(hash: string, should: boolean) {
    //this.logger.debug('shouldDownload ' + hash+' '+should);
    this._initialize();

    return new Promise<RtorrentTorrent[]>((resolve, reject) => {
      this.getTorrentFiles(hash, (err1, files: RTorrentFile[]) => {
        if (err1) {
          return reject(err1);
        }

        files.forEach(f => {
          this._ftpSeedService.shouldDownload(f.fullpath, f.size, should);
        });
        //this.logger.debug(files);
        this.getTorrents()
          .then(torrents => {
            resolve(torrents);
          })
          .catch(err2 => {
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
}
