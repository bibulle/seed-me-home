import { Injectable } from '@angular/core';
import { Environment } from '@seed-me-home/models';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private frontendVersion: string;

  private environment = new Environment();

  private environmentChangedSubject: BehaviorSubject<Environment>;
  private versionChangedSubject: BehaviorSubject<boolean>;

  constructor() {
    this.frontendVersion = this.environment.version;

    this.environmentChangedSubject = new BehaviorSubject<Environment>(this.environment);
    this.versionChangedSubject = new BehaviorSubject<boolean>(false);
  }

  setEnvironement(environment: Environment) {
    this.environment = environment;

    this.versionChangedSubject.next(this.frontendVersion !== this.environment.version);
    this.environmentChangedSubject.next(this.environment);
  }

  /**
   * Get the observable on version changes
   * @returns {Observable<boolean>}
   */
  versionChangedObservable(): Observable<boolean> {
    return this.versionChangedSubject.pipe(distinctUntilChanged());
  }
  /**
   * Get the observable on version changes
   * @returns {Observable<Environment>}
   */
  environmentChangedObservable(): Observable<Environment> {
    return this.environmentChangedSubject.pipe(distinctUntilChanged());
  }
}
