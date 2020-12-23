import {
  Component,
  EventEmitter,
  Inject,
  Input,
  NgModule,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { RtorrentTorrent } from '@seed-me-home/models';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BytesSizeModule } from '../../../utils/pipes/bytes-size.pipe';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import { RtorrentTorrentsService } from '../rtorrent-torrents.service';

@Component({
  selector: 'seed-me-home2-rtorrent-torrent-item',
  templateUrl: './rtorrent-torrent-item.component.html',
  styleUrls: ['./rtorrent-torrent-item.component.scss'],
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

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(
    private _translateService: TranslateService,
    private _rtorrentTorrentsService: RtorrentTorrentsService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {}

  formatDate(dateMilli: number) {
    moment.locale(this._translateService.currentLang);

    return moment.utc(dateMilli).format('lll');
  }

  toggleSort(sort: string) {
    this.toggleSortEvent.emit(sort);
  }

  pause() {
    this._rtorrentTorrentsService.pauseTorrent(this.torrent.hash);
  }

  start() {
    this._rtorrentTorrentsService.startTorrent(this.torrent.hash);
  }

  shouldGetFromSeeBox(b: boolean) {
    this._rtorrentTorrentsService.shouldGetFromSeeBox(this.torrent.hash, b);
  }

  remove() {
    const dialogRef = this.dialog.open(RtorrentTorrentItemDialogComponent, {
      width: '80%',
      data: this.torrent.name,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._rtorrentTorrentsService.removeTorrent(this.torrent.hash);
      }
    });
  }
}

@Component({
  selector: 'seed-me-home2-rtorrent-torrent-item-dialog',
  templateUrl: './rtorrent-torrent-item-dialog.component.html',
  styleUrls: ['./rtorrent-torrent-item-dialog.component.scss'],
})
export class RtorrentTorrentItemDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RtorrentTorrentItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public torrentName: string
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    BytesSizeModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatMenuModule,
  ],
  entryComponents: [RtorrentTorrentItemDialogComponent],
  declarations: [
    RtorrentTorrentItemComponent,
    RtorrentTorrentItemDialogComponent,
  ],
  providers: [],
  exports: [RtorrentTorrentItemComponent],
})
export class RtorrentTorrentItemModule {}
