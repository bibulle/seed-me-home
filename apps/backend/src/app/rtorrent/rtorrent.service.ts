import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../services/config/config.service';
import * as _ from 'lodash';
import { RtorrentStatus, RtorrentTorrent } from '@seed-me-home/models';
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
              torrent.files.forEach(file => {
                const progress = this._ftpSeedService.getProgression(file.path);
                if (progress && progress.value) {
                  file.downloaded = progress.value;
                  total_downloaded += progress.value;
                } else {
                  file.downloaded = 0;
                }
              });
              torrent.downloaded = total_downloaded;
              // if (torrent.name.startsWith('La Symphonie')) {
              //   this.logger.debug(torrent);
              // }
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

  getTorrentFiles(hash: string, callback: (err, status) => void) {
    this._initialize();
    this._rtorrent.getTorrentFiles(hash, (err, status) => {
      callback(err, status);
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
