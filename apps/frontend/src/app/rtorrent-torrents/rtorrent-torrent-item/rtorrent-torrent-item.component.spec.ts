import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RtorrentTorrentItemComponent } from './rtorrent-torrent-item.component';
import { MatIconModule, MatProgressBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';
import { By } from '@angular/platform-browser';
import { RtorrentTorrent } from '@seed-me-home/models';
import * as moment from 'moment';
import { DebugElement } from '@angular/core';

const torrent1: RtorrentTorrent = {
  active: false,
  open: false,
  hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
  path: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
  name: 'ubuntu-18.10-desktop-amd64.iso',
  size: 1999503360,
  completed: 1155399680,
  down_rate: 19944210,
  down_total: 1196652654,
  downloaded: 399900672,
  up_rate: 0,
  up_total: 0,
  createdAt: 1539860537,
  addtime: 1552911761,
  complete: false,
  leechers: 1,
  seeders: 99,
  ratio: 0.234,
  files: [
    {
      size: '1999503360',
      downloaded: 199950336,
      fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
      path: 'ubuntu-18.10-desktop-amd64.iso'
    },
    {
      size: '1999503360',
      downloaded: 199950336,
      fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
      path: 'ubuntu-18.10-desktop-amd64.iso2'
    }
  ]
};

describe('RtorrentTorrentItemComponent', () => {
  let component: RtorrentTorrentItemComponent;
  let fixture: ComponentFixture<RtorrentTorrentItemComponent>;

  beforeEach(async(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [MatIconModule, MatProgressBarModule, TranslateModule.forRoot(), BytesSizeModule],
      declarations: [RtorrentTorrentItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RtorrentTorrentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display items value', () => {
    component.torrent = torrent1;

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.title')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.title span')).nativeElement.textContent).toBe(torrent1.name);

    expect(fixture.debugElement.queryAll(By.css('.size')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.size')).nativeElement.textContent).toBe(
      (torrent1.size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
    );

    expect(fixture.debugElement.queryAll(By.css('.down')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.down')).nativeElement.textContent).toBe(
      'cloud_download' + (torrent1.down_rate / 1024 / 1024).toFixed(2) + ' MB/s '
    );

    expect(fixture.debugElement.queryAll(By.css('.up')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.up')).nativeElement.textContent).toBe(
      'cloud_upload' + torrent1.up_rate + ' B/s '
    );

    expect(fixture.debugElement.queryAll(By.css('.ratio')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.ratio')).nativeElement.textContent).toBe(
      'compare_arrows' + torrent1.ratio.toFixed(2) + ' '
    );

    expect(fixture.debugElement.queryAll(By.css('.date')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.date')).nativeElement.textContent).toBe(
      moment.utc(torrent1.addtime * 1000).format('lll')
    );
  });

  it('icon before name should be the right one', () => {
    component.torrent = torrent1;

    // torrent active is false => pause
    component.torrent.completed = component.torrent.size / 4;
    component.torrent.downloaded = 0;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('pause');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '25'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '0'
    );

    // torrent active is true and complete is false => cloud_download
    component.torrent.active = true;
    component.torrent.complete = false;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('cloud_download');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '25'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '0'
    );

    // torrent active is true and complete is true and downloaded is zero => save_alt (red)
    component.torrent.complete = true;
    component.torrent.completed = component.torrent.size;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('save_alt');
    expect(fixture.debugElement.query(By.css('.title mat-icon')).attributes['color']).toBe('warn');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '100'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '0'
    );

    // torrent active is true and complete is true and downloaded is not zero => save_alt (not red)
    component.torrent.downloaded = component.torrent.size / 2;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('save_alt');
    expect(fixture.debugElement.query(By.css('.title mat-icon')).attributes['color']).toBe('primary');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '100'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '50'
    );

    // torrent active is true and complete is true and downloaded is size => done
    component.torrent.downloaded = component.torrent.size;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(1);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('done');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '100'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '100'
    );
  });

  it('ratio should be colored', () => {
    component.torrent = torrent1;

    expect(fixture.debugElement.queryAll(By.css('.ratio')).length).toBe(1);

    component.torrent.ratio = 0.09;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['very-bad']).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['good']).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['very-good']).toBeFalsy();

    component.torrent.ratio = 1.1;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['very-bad']).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['good']).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['very-good']).toBeFalsy();

    component.torrent.ratio = 2.1;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['very-bad']).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['good']).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ratio')).classes['very-good']).toBeTruthy();
  });

  it('up and down rate should be highlighted', () => {
    component.torrent = torrent1;

    expect(fixture.debugElement.queryAll(By.css('.up')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('.down')).length).toBe(1);

    component.torrent.up_rate = 0;
    component.torrent.down_rate = 0;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.up')).classes['highlight']).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.down')).classes['highlight']).toBeFalsy();

    component.torrent.up_rate = 0;
    component.torrent.down_rate = 1;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.up')).classes['highlight']).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.down')).classes['highlight']).toBeTruthy();

    component.torrent.up_rate = 1;
    component.torrent.down_rate = 0;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.up')).classes['highlight']).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.down')).classes['highlight']).toBeFalsy();

    component.torrent.up_rate = 1;
    component.torrent.down_rate = 1;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.up')).classes['highlight']).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.down')).classes['highlight']).toBeTruthy();
  });

  it('header should be displayed on first item', () => {
    component.index = 0;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.header')).length).toBe(1);

    component.index = 1;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.header')).length).toBe(0);
  });

  it('sort item should be correct', () => {
    component.index = 0;
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.header .size')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('.header .down')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('.header .up')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('.header .ratio')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('.header .date')).length).toBe(1);

    const itemSize = fixture.debugElement.query(By.css('.header .size'));
    const itemDown = fixture.debugElement.query(By.css('.header .down'));
    const itemUp = fixture.debugElement.query(By.css('.header .up'));
    const itemRatio = fixture.debugElement.query(By.css('.header .ratio'));
    const itemDate = fixture.debugElement.query(By.css('.header .date'));

    component.sortItem = 'size';
    component.sortDirection = 'asc';
    fixture.detectChanges();
    testItem(itemSize, 'up', true);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'down', false);

    component.sortDirection = 'desc';
    fixture.detectChanges();
    testItem(itemSize, 'down', true);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'down', false);

    component.sortItem = 'down';
    component.sortDirection = 'asc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'up', true);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'down', false);

    component.sortDirection = 'desc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'down', true);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'down', false);

    component.sortItem = 'up';
    component.sortDirection = 'asc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'up', true);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'down', false);

    component.sortDirection = 'desc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'down', true);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'down', false);

    component.sortItem = 'ratio';
    component.sortDirection = 'asc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'up', true);
    testItem(itemDate, 'down', false);

    component.sortDirection = 'desc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'down', true);
    testItem(itemDate, 'down', false);

    component.sortItem = 'date';
    component.sortDirection = 'asc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'up', true);

    component.sortDirection = 'desc';
    fixture.detectChanges();
    testItem(itemSize, 'down', false);
    testItem(itemDown, 'down', false);
    testItem(itemUp, 'down', false);
    testItem(itemRatio, 'down', false);
    testItem(itemDate, 'down', true);
  });

  it('click on header should toggle the sort', () => {
    component.index = 0;

    let selected = '';
    component.toggleSortEvent.subscribe(value => (selected = value));
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.header .size')).triggerEventHandler('click', null);
    expect(selected).toBe('size');

    fixture.debugElement.query(By.css('.header .size')).triggerEventHandler('click', null);
    expect(selected).toBe('size');

    fixture.debugElement.query(By.css('.header .up')).triggerEventHandler('click', null);
    expect(selected).toBe('up');

    fixture.debugElement.query(By.css('.header .down')).triggerEventHandler('click', null);
    expect(selected).toBe('down');

    fixture.debugElement.query(By.css('.header .ratio')).triggerEventHandler('click', null);
    expect(selected).toBe('ratio');

    fixture.debugElement.query(By.css('.header .date')).triggerEventHandler('click', null);
    expect(selected).toBe('date');
  });
});

const testItem = (item: DebugElement, direction: string, selected: boolean) => {
  if (direction === 'up') {
    expect(item.nativeElement.textContent).toContain('keyboard_arrow_up');
    expect(item.nativeElement.textContent).not.toContain('keyboard_arrow_down');
  } else {
    expect(item.nativeElement.textContent).toContain('keyboard_arrow_down');
    expect(item.nativeElement.textContent).not.toContain('keyboard_arrow_up');
  }
  if (!selected) {
    expect(item.classes['unselected']).toBeTruthy();
  } else {
    expect(item.classes['unselected']).toBeFalsy();
  }
};
