import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtorrentStatusComponent } from './rtorrent-status.component';
import { RtorrentStatusService } from './rtorrent-status.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable, Subject } from 'rxjs';
import { RtorrentStatus } from '@seed-me-home/models';

fdescribe('RtorrentStatusComponent', () => {
  let component: RtorrentStatusComponent;
  let fixture: ComponentFixture<RtorrentStatusComponent>;
  let rtorrentStatusService: RtorrentStatusServiceMock;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [RtorrentStatusComponent],
      providers: [{ provide: RtorrentStatusService, useClass: RtorrentStatusServiceMock }]
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
      free_disk_space: 24319991808
    };

    component.ngOnInit();
    expect(component.rtorrentStatus).toBeUndefined();

    rtorrentStatusService.status$.next(goodAnswer);
    fixture.detectChanges();
    expect(component.rtorrentStatus).toEqual(goodAnswer);
  });
});

class RtorrentStatusServiceMock {
  status$: Subject<RtorrentStatus> = new Subject<RtorrentStatus>();

  currentStatusObservable(): Observable<RtorrentStatus> {
    return this.status$;
  }
  startLoadingStats() {}
}
