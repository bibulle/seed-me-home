import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedsComponent } from './seeds.component';
import { TranslateModule } from '@ngx-translate/core';
import { RtorrentStatusComponent } from '../rtorrent-status/rtorrent-status.component';
import { NotificationModule } from '../notification/notification.service';

describe('SeedsComponent', () => {
  let component: SeedsComponent;
  let fixture: ComponentFixture<SeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NotificationModule],
      declarations: [SeedsComponent, RtorrentStatusComponent]
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
