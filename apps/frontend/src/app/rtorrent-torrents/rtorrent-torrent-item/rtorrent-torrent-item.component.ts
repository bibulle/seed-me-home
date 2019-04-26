import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { RtorrentTorrent } from '@seed-me-home/models';
import { MatIconModule, MatProgressBarModule } from '@angular/material';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-rtorrent-torrent-item',
  templateUrl: './rtorrent-torrent-item.component.html',
  styleUrls: ['./rtorrent-torrent-item.component.scss']
})
export class RtorrentTorrentItemComponent implements OnInit {
  @Input()
  torrent: RtorrentTorrent;

  @Input()
  index: number;

  @Input()
  sortItem: string;

  @Input()
  sortDirection: string;

  @Output()
  toggleSortEvent = new EventEmitter<string>();

  constructor(private _translateService: TranslateService) {}

  ngOnInit() {}

  formatDate(dateMilli: number) {
    moment.locale(this._translateService.currentLang);

    return moment.utc(dateMilli).format('lll');
  }

  toggleSort(sort: string) {
    this.toggleSortEvent.emit(sort);
  }
}

@NgModule({
  imports: [CommonModule, TranslateModule, BytesSizeModule, MatIconModule, MatProgressBarModule],
  declarations: [RtorrentTorrentItemComponent],
  providers: [],
  exports: [RtorrentTorrentItemComponent]
})
export class RtorrentTorrentItemModule {}
