import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export class RefreshingStatus {
  refreshing = false;
  refreshInSecondeMax = 40;
  counterStart = 0;
}

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private readonly refreshingStatus: RefreshingStatus;
  private readonly refreshingStatusSubject: BehaviorSubject<RefreshingStatus>;
  callbackList: (() => void)[] = [];

  constructor() {
    this.refreshingStatus = new RefreshingStatus();

    this.refreshingStatusSubject = new BehaviorSubject<RefreshingStatus>(this.refreshingStatus);
  }

  // Configuration management
  revfreshingObservable(): Observable<RefreshingStatus> {
    return this.refreshingStatusSubject;
  }

  setRefreshing(refreshing: boolean) {
    if (refreshing !== this.refreshingStatus.refreshing) {
      this.refreshingStatus.refreshing = refreshing;
      this.refreshingStatusSubject.next(this.refreshingStatus);
    }
  }
  setRefreshingTimout(timeout: number, callback: () => void) {
    this.refreshingStatus.refreshInSecondeMax = timeout;
    this.refreshingStatus.counterStart = new Date().getTime();
    this.refreshingStatusSubject.next(this.refreshingStatus);

    if (
      !this.callbackList.some((f) => {
        return f.toString() === callback.toString();
      })
    ) {
      this.callbackList.push(callback);
    }
    // console.log(this.callbackList.length);
  }

  launchRefresh() {
    this.callbackList.forEach((f) => {
      // console.log(f)
      f();
    });
  }
}
