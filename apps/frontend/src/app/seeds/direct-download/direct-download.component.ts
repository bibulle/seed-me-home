import { Component, OnDestroy, OnInit } from '@angular/core';
import { DirectDownload } from '@seed-me-home/models';
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

  sortItem = 'date';
  sortDirection = 'desc';

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
    this.directDownloads.sort((r1: DirectDownload, r2: DirectDownload) => {
      let ret = 0;
      switch (this.sortItem) {
        case 'date':
          ret = r1.downloadStarted.getTime() - r2.downloadStarted.getTime();
          break;
        case 'size':
          ret = r1.size - r2.size;
          break;
        case 'progress':
          ret = r1.downloaded / Math.max(1, r1.size) - r2.downloaded / Math.max(1, r2.size);
          break;
      }

      if (ret === 0) {
        ret = r1.downloadStarted.getTime() - r2.downloadStarted.getTime();
      }
      return ret;
    });
    if (this.sortDirection === 'desc') {
      this.directDownloads.reverse();
    }
  }
}
