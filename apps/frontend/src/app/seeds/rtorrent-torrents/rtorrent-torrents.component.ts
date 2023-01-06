import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { RtorrentTorrentsService } from './rtorrent-torrents.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';
import { RtorrentTorrent } from '@seed-me-home/models';
import { RtorrentTorrentItemModule } from './rtorrent-torrent-item/rtorrent-torrent-item.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'seed-me-home-rtorrent-torrents',
  templateUrl: './rtorrent-torrents.component.html',
  styleUrls: ['./rtorrent-torrents.component.scss'],
})
export class RtorrentTorrentsComponent implements OnInit, OnDestroy {
  rtorrentTorrents: RtorrentTorrent[];
  private _currentRtorrentTorrentSubscription: Subscription;

  sortItem = 'date';
  sortDirection = 'desc';

  constructor(private _rtorrentTorrentsService: RtorrentTorrentsService) {}

  ngOnInit() {
    this._currentRtorrentTorrentSubscription = this._rtorrentTorrentsService.currentTorrentsObservable().subscribe((torrents: RtorrentTorrent[]) => {
      this.rtorrentTorrents = torrents;
      this._doSort();
    });

    this._rtorrentTorrentsService.startLoadingTorrents();
  }

  ngOnDestroy() {
    if (this._currentRtorrentTorrentSubscription) {
      this._currentRtorrentTorrentSubscription.unsubscribe();
    }
  }

  toggleSort(sort: string) {
    if (sort === this.sortItem) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortItem = sort;
      this.sortDirection = 'desc';
    }
    this._doSort();
  }

  _doSort() {
    this.rtorrentTorrents.sort((r1: RtorrentTorrent, r2: RtorrentTorrent) => {
      let ret = 0;
      switch (this.sortItem) {
        case 'date':
          ret = r1.addtime - r2.addtime;
          break;
        case 'ratio':
          ret = r1.ratio - r2.ratio;
          break;
        case 'down':
          ret = r1.down_rate - r2.down_rate;
          break;
        case 'up':
          ret = r1.up_rate - r2.up_rate;
          break;
        case 'size':
          ret = r1.size - r2.size;
          break;
        case 'progress':
          ret = (r1.completed + r1.downloaded) / Math.max(1, r1.size) - (r2.completed + r2.downloaded) / Math.max(1, r2.size);
          break;
      }

      if (ret === 0) {
        ret = r1.addtime - r2.addtime;
      }
      return ret;
    });
    if (this.sortDirection === 'desc') {
      this.rtorrentTorrents.reverse();
    }
  }
}

@NgModule({
  imports: [CommonModule, MatCardModule, TranslateModule, MatIconModule, BytesSizeModule, RtorrentTorrentItemModule],
  declarations: [RtorrentTorrentsComponent],
  providers: [RtorrentTorrentsService],
  exports: [RtorrentTorrentsComponent],
})
export class RtorrentTorrentsModule {}
