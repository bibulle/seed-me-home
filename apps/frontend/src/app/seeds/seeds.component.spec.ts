import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedsComponent } from './seeds.component';
import { TranslateModule } from '@ngx-translate/core';
import { RtorrentStatusModule } from '../rtorrent-status/rtorrent-status.component';
import { NotificationModule } from '../notification/notification.service';
import { RtorrentTorrentsModule } from '../rtorrent-torrents/rtorrent-torrents.component';

describe('SeedsComponent', () => {
  let component: SeedsComponent;
  let fixture: ComponentFixture<SeedsComponent>;

  beforeEach(async(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NotificationModule, RtorrentStatusModule, RtorrentTorrentsModule],
      declarations: [SeedsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
