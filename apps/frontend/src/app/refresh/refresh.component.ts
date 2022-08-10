import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RefreshingStatus, RefreshService } from './refresh.service';

@Component({
  selector: 'seed-me-home-refresh',
  templateUrl: './refresh.component.html',
  styleUrls: ['./refresh.component.scss'],
})
export class RefreshComponent implements OnInit {
  progressValue = 0;

  private _currentRefreshingStatusSubscription: Subscription;
  refreshingStatus: RefreshingStatus = new RefreshingStatus();

  dateLasteRefreshChange = 0;

  constructor(private _refresService: RefreshService) {
    setInterval(() => {
      this.progressValue = Math.ceil(100 * Math.min(1, (new Date().getTime() - this.refreshingStatus.counterStart) / (this.refreshingStatus.refreshInSecondeMax * 1000)));
      // console.log(this.progressValue);
    }, 1000);
  }

  ngOnInit(): void {
    this._currentRefreshingStatusSubscription = this._refresService.revfreshingObservable().subscribe((rel) => {
      if (rel.refreshing && !this.refreshingStatus.refreshing) {
        this.refreshingStatus.refreshing = true;
        this.dateLasteRefreshChange = new Date().getTime();
      }
      if (!rel.refreshing && this.refreshingStatus.refreshing) {
        const now = new Date().getTime();
        const delta = Math.max(500 + this.dateLasteRefreshChange - now, 0);
        setTimeout(() => {
          this.refreshingStatus.refreshing = false;
        }, delta);
      }

      this.refreshingStatus.refreshInSecondeMax = rel.refreshInSecondeMax;
      this.refreshingStatus.counterStart = rel.counterStart;
    });
  }

  refresh() {
    this._refresService.launchRefresh();
  }
}
