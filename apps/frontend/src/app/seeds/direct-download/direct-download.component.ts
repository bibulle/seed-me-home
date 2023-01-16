import { Component, OnDestroy, OnInit } from '@angular/core';
import { DirectDownload, RtorrentTorrent } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { DirectDownloadService } from './direct-download.service';

@Component({
  selector: 'seed-me-home-direct-download',
  templateUrl: './direct-download.component.html',
  styleUrls: ['./direct-download.component.scss'],
})
export class DirectDownloadComponent implements OnInit, OnDestroy {
  newUrl: string;
  newUrlOk = false;

  directDownloads: DirectDownload[];
  private _currentDirectDownloadSubscription: Subscription;

  constructor(private _directDownloadService: DirectDownloadService) {}
  ngOnInit() {
    this._currentDirectDownloadSubscription = this._directDownloadService.currentDownloadsObservable().subscribe((downloads: DirectDownload[]) => {
      this.directDownloads = downloads;
      this._doSort();
    });
    this._directDownloadService.startLoadingDownloads();
  }

  ngOnDestroy() {
    if (this._currentDirectDownloadSubscription) {
      this._currentDirectDownloadSubscription.unsubscribe();
    }
  }

  newUrlChange(value) {
    this.newUrlOk = this._isValidHttpUrl(value);
  }

  addUrl() {
    this._directDownloadService.addUrl(this.newUrl);
  }

  private _isValidHttpUrl(string): boolean {
    let url: URL;
    try {
      url = new URL(string);
    } catch (error) {
      // console.log(error);
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  _doSort() {
    return;
  }
}
