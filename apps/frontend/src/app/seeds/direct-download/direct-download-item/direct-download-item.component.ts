import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { DirectDownload } from '@seed-me-home/models';
import * as moment from 'moment';
import { DirectDownloadService } from '../direct-download.service';

@Component({
  selector: 'seed-me-home-direct-download-item',
  templateUrl: './direct-download-item.component.html',
  styleUrls: ['./direct-download-item.component.scss'],
})
export class DirectDownloadItemComponent implements OnInit {
  @Input()
  download: DirectDownload;

  @Input()
  index: number;

  @Input()
  sortItem: string;

  @Input()
  sortDirection: string;

  @Output()
  toggleSortEvent = new EventEmitter<string>();

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(private _translateService: TranslateService, private _directDownloadService: DirectDownloadService, public dialog: MatDialog) {}

  ngOnInit(): void {
    console.log(this.download);
  }

  formatDate(dateMilli: number) {
    moment.locale(this._translateService.currentLang);

    return moment.utc(dateMilli).format('lll');
  }

  toggleSort(sort: string) {
    this.toggleSortEvent.emit(sort);
  }

  remove() {
    // const dialogRef = this.dialog.open(RtorrentTorrentItemDialogComponent, {
    //   width: '80%',
    //   data: this.torrent.name,
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this._rtorrentTorrentsService.removeTorrent(this.torrent.hash);
    //   }
    // });
  }
}
