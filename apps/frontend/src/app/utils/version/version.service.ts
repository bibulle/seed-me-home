import { Injectable } from '@angular/core';
import { Version } from '@seed-me-home/models';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  constructor() {
    this.versionChangedSubject = new BehaviorSubject<boolean>(false);
  }

  static backendVersion: string;

  private versionChangedSubject: BehaviorSubject<boolean>;

  checkVersion() {
    //console.log('VersionService checkVersion');

    if (VersionService.backendVersion) {
      //console.log('Version changed '+new Version().version+' != '+VersionService.backendVersion);
      this.versionChangedSubject.next(new Version().version !== VersionService.backendVersion);
    }
  }

  /**
   * Get the observable on version changes
   * @returns {Observable<boolean>}
   */
  versionChangedObservable(): Observable<boolean> {
    return this.versionChangedSubject.pipe(distinctUntilChanged());
  }
}
