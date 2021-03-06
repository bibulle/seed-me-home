import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtorrentStatusComponent } from './rtorrent-status.component';
import { RtorrentStatusService } from './rtorrent-status.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Observable, Subject } from 'rxjs';
import { RtorrentStatus } from '@seed-me-home/models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';

describe('RtorrentStatusComponent', () => {
  let component: RtorrentStatusComponent;
  let fixture: ComponentFixture<RtorrentStatusComponent>;
  let rtorrentStatusService: RtorrentStatusServiceMock;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatIconModule,
        MatCardModule,
        TranslateModule.forRoot(),
        BytesSizeModule,
      ],
      declarations: [RtorrentStatusComponent],
      providers: [
        { provide: RtorrentStatusService, useClass: RtorrentStatusServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RtorrentStatusComponent);
    component = fixture.componentInstance;

    rtorrentStatusService = TestBed.get(RtorrentStatusService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rtorrentStatus should be update', () => {
    const goodAnswer: RtorrentStatus = {
      down_rate: 28,
      down_total: 463360286085,
      up_rate: 191,
      up_total: 1293694778894,
      free_disk_space: 24319991808,
      free_disk_space_local: 24319991808,
    };

    component.ngOnInit();
    expect(component.rtorrentStatus).toBeUndefined();

    // we should have subscribe
    expect(rtorrentStatusService.status$.observers.length).toBe(1);

    rtorrentStatusService.status$.next(goodAnswer);
    fixture.detectChanges();
    expect(component.rtorrentStatus).toEqual(goodAnswer);

    // after destroy, we should unsubscribe
    component.ngOnDestroy();
    // TODO : due to rxjs bug, commented code
    //expect(rtorrentStatusService.status$.observers.length).toBe(0);
  });
});

class RtorrentStatusServiceMock {
  status$: Subject<RtorrentStatus> = new Subject<RtorrentStatus>();

  //noinspection JSUnusedGlobalSymbols
  currentStatusObservable(): Observable<RtorrentStatus> {
    return this.status$;
  }
  startLoadingStats() {}
}
