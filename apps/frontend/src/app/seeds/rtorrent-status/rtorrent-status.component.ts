import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { RtorrentStatusService } from './rtorrent-status.service';
import { RtorrentStatus } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';

@Component({
  selector: 'seed-me-home2-rtorrent-status',
  templateUrl: './rtorrent-status.component.html',
  styleUrls: ['./rtorrent-status.component.scss'],
})
export class RtorrentStatusComponent implements OnInit, OnDestroy {
  rtorrentStatus: RtorrentStatus;
  private _currentRtorrentStatusSubscription: Subscription;

  constructor(private _rtorrentStatusService: RtorrentStatusService) {}

  ngOnInit() {
    this._currentRtorrentStatusSubscription = this._rtorrentStatusService
      .currentStatusObservable()
      .subscribe((status: RtorrentStatus) => {
        this.rtorrentStatus = status;
      });

    this._rtorrentStatusService.startLoadingStats();
  }

  ngOnDestroy() {
    if (this._currentRtorrentStatusSubscription) {
      this._currentRtorrentStatusSubscription.unsubscribe();
    }
  }
}

@NgModule({
  imports: [MatCardModule, TranslateModule, MatIconModule, BytesSizeModule],
  declarations: [RtorrentStatusComponent],
  providers: [RtorrentStatusService],
  exports: [RtorrentStatusComponent],
})
export class RtorrentStatusModule {}
