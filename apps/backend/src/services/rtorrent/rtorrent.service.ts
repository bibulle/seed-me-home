import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import * as _ from 'lodash';

const Rtorrent = require('@electorrent/node-rtorrent');

@Injectable()
export class RtorrentService {
  private _rtorrent;

  constructor(private _configService: ConfigService) {
    this._rtorrent = new Rtorrent({
      mode: this._configService.getSeedboxMode(),
      host: this._configService.getSeedboxHost(),
      port: this._configService.getSeedboxPort(),
      path: this._configService.getSeedboxPath(),
      user: this._configService.getSeedboxUser(),
      pass: this._configService.getSeedboxPass()
    });
  }

  forceRtorrentForMocking(mockRtorrent: any) {
    this._rtorrent = mockRtorrent;
  }

  getGlobals(callback: (err, status) => void) {
    this._rtorrent.getGlobals((err, status) => {
      if (status) {
        status = _.pick(status, ['down_rate', 'down_total', 'up_rate', 'up_total']);
      }

      callback(err, status);
    });
  }

  getAll(callback: (err, status) => void) {
    this._rtorrent.getAll((err, status) => {
      if (status) {
        status = _.pick(status, ['down_rate', 'down_total', 'up_rate', 'up_total', 'free_disk_space', 'torrents']);

        status.torrents = _.map(
          status.torrents,
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
            'files'
          ])
        );
      }

      callback(err, status);
    });
  }

  getTorrentFiles(hash: string, callback: (err, status) => void) {
    this._rtorrent.getTorrentFiles(hash, (err, status) => {
      callback(err, status);
    });
  }

  //  getTorrentsExtra (callback: (err, status) => void) {
  //    this._rtorrent.getTorrentsExtra(callback);
  //  }

  //  getTorrents (callback: (err, status) => void) {
  //    this._rtorrent.getTorrents(callback);
  //  }

  //  getTorrentTrackers (callback: (err, status) => void) {
  //    this._rtorrent.getTorrentTrackers(callback);
  //  }

  //  getTorrentPeers (callback: (err, status) => void) {
  //    this._rtorrent.getTorrentPeers(callback);
  //  }
}
