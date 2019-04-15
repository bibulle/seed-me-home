import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { RtorrentStatusService } from './rtorrent-status.service';
import { RtorrentStatus } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material';

@Component({
  selector: 'app-rtorrent-status',
  templateUrl: './rtorrent-status.component.html',
  styleUrls: ['./rtorrent-status.component.scss']
  //template: `<a [hidden]="needsLogin()">Login</a>`
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
  imports: [MatSnackBarModule, HttpClientModule],
  declarations: [RtorrentStatusComponent],
  providers: [RtorrentStatusService],
  exports: [RtorrentStatusComponent]
})
export class RtorrentStatusModule {}
