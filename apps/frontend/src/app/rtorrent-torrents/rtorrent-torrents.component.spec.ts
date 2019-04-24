import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtorrentTorrentsComponent } from './rtorrent-torrents.component';
import { RtorrentTorrentsService } from './rtorrent-torrents.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable, Subject } from 'rxjs';
import { RtorrentTorrent } from '@seed-me-home/models';
import { RtorrentTorrentItemComponent } from './rtorrent-torrent-item/rtorrent-torrent-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule, MatIconModule } from '@angular/material';
import { BytesSizePipe } from '../utils/pipes/bytes-size.pipe';

//noinspection SpellCheckingInspection
const goodAnswer: RtorrentTorrent[] = [
  {
    hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
    path: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
    name: 'ubuntu-18.10-desktop-amd64.iso',
    size: 1999503360,
    completed: 1155399680,
    down_rate: 19944210,
    down_total: 1196652654,
    up_rate: 0,
    up_total: 0,
    createdAt: 1539860537,
    addtime: 1552911761,
    complete: false,
    leechers: 1,
    seeders: 99,
    ratio: 0,
    files: [
      {
        size: '1999503360',
        fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso'
      }
    ]
  },
  {
    hash: '4A03DA39750C4BDD0FEBB66D8B138CEEA5993FAA',
    path: '/home/14user/rutorrent/torrents/ubuntu-14.04.6-desktop-amd64.iso',
    name: 'ubuntu-14.04.6-desktop-amd64.iso',
    size: 1157627904,
    completed: 541589504,
    down_rate: 9475376,
    down_total: 568522562,
    up_rate: 0,
    up_total: 0,
    createdAt: 1551970024,
    addtime: 1552911800,
    complete: false,
    leechers: 0,
    seeders: 36,
    ratio: 0.1,
    files: [
      {
        size: '1157627904',
        fullpath: '/home/14user/rutorrent/torrents/ubuntu-14.04.6-desktop-amd64.iso'
      }
    ]
  }
];

describe('RtorrentTorrentsComponent', () => {
  let component: RtorrentTorrentsComponent;
  let fixture: ComponentFixture<RtorrentTorrentsComponent>;
  let rtorrentTorrentsService: RtorrentTorrentsServiceMock;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), MatCardModule, MatIconModule],
      declarations: [RtorrentTorrentsComponent, RtorrentTorrentItemComponent, BytesSizePipe],
      providers: [{ provide: RtorrentTorrentsService, useClass: RtorrentTorrentsServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(RtorrentTorrentsComponent);
    component = fixture.componentInstance;

    rtorrentTorrentsService = TestBed.get(RtorrentTorrentsService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rtorrentTorrents should be update', () => {
    component.ngOnInit();
    expect(component.rtorrentTorrents).toBeUndefined();

    // we should have subscribe
    expect(rtorrentTorrentsService.torrents$.observers.length).toBe(1);

    rtorrentTorrentsService.torrents$.next(goodAnswer);
    fixture.detectChanges();
    expect(component.rtorrentTorrents).toEqual(goodAnswer);

    // after destroy, we should unsubscribe
    component.ngOnDestroy();
    // TODO : due to rxjs bug, commented code
    //expect(rtorrentTorrentsService.torrents$.observers.length).toBe(0);
  });

  it('toggle sort should do the job', () => {
    component.ngOnInit();
    rtorrentTorrentsService.torrents$.next(goodAnswer);
    fixture.detectChanges();

    // default values
    expect(component.sortItem).toBe('date');
    expect(component.sortDirection).toBe('desc');
    expect(component.rtorrentTorrents[0].addtime).toBe(1552911800);

    // after a click, order should be inverted
    component.toggleSort('date');
    expect(component.sortItem).toBe('date');
    expect(component.sortDirection).toBe('asc');
    expect(component.rtorrentTorrents[0].addtime).toBe(1552911761);

    // after a click, order should be re-inverted
    component.toggleSort('date');
    expect(component.sortItem).toBe('date');
    expect(component.sortDirection).toBe('desc');
    expect(component.rtorrentTorrents[0].addtime).toBe(1552911800);

    // after a click on another button, order should be different
    component.toggleSort('ratio');
    expect(component.sortItem).toBe('ratio');
    expect(component.sortDirection).toBe('desc');
    expect(component.rtorrentTorrents[0].ratio).toBe(0.1);
    component.toggleSort('ratio');
    expect(component.sortItem).toBe('ratio');
    expect(component.sortDirection).toBe('asc');
    expect(component.rtorrentTorrents[0].ratio).toBe(0);

    // after a click on another button, order should be different (equality, should be by date then)
    component.toggleSort('up');
    expect(component.sortItem).toBe('up');
    expect(component.sortDirection).toBe('desc');
    expect(component.rtorrentTorrents[0].up_rate).toBe(0);
    expect(component.rtorrentTorrents[0].addtime).toBe(1552911800);
    component.toggleSort('up');
    expect(component.sortItem).toBe('up');
    expect(component.sortDirection).toBe('asc');
    expect(component.rtorrentTorrents[0].up_rate).toBe(0);
    expect(component.rtorrentTorrents[0].addtime).toBe(1552911761);

    // after a click on another button, order should be different
    component.toggleSort('down');
    expect(component.sortItem).toBe('down');
    expect(component.sortDirection).toBe('desc');
    expect(component.rtorrentTorrents[0].down_rate).toBe(19944210);
    component.toggleSort('down');
    expect(component.sortItem).toBe('down');
    expect(component.sortDirection).toBe('asc');
    expect(component.rtorrentTorrents[0].down_rate).toBe(9475376);

    // after a click on another button, order should be different
    component.toggleSort('size');
    expect(component.sortItem).toBe('size');
    expect(component.sortDirection).toBe('desc');
    expect(component.rtorrentTorrents[0].size).toBe(1999503360);
    component.toggleSort('size');
    expect(component.sortItem).toBe('size');
    expect(component.sortDirection).toBe('asc');
    expect(component.rtorrentTorrents[0].size).toBe(1157627904);
  });
});

class RtorrentTorrentsServiceMock {
  torrents$: Subject<RtorrentTorrent[]> = new Subject<RtorrentTorrent[]>();

  //noinspection JSUnusedGlobalSymbols
  currentTorrentsObservable(): Observable<RtorrentTorrent[]> {
    return this.torrents$;
  }
  //noinspection JSUnusedGlobalSymbols
  startLoadingTorrents() {}
}
