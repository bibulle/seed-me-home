import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RtorrentTorrentItemComponent, RtorrentTorrentItemDialogComponent } from './rtorrent-torrent-item.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatIconModule,
  MatMenuModule,
  MatProgressBarModule
} from '@angular/material';
import {
  DefaultLangChangeEvent,
  LangChangeEvent,
  TranslateModule,
  TranslateService,
  TranslationChangeEvent
} from '@ngx-translate/core';
import { BytesSizeModule } from '../../../utils/pipes/bytes-size.pipe';
import { BrowserModule, By } from '@angular/platform-browser';
import { RtorrentTorrent } from '@seed-me-home/models';
import * as moment from 'moment';
import { DebugElement, EventEmitter } from '@angular/core';
import { RtorrentTorrentsService } from '../rtorrent-torrents.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
  shouldDownload: false,
  files: [
    {
      size: 1999503360,
      downloaded: 199950336,
      fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
      path: 'ubuntu-18.10-desktop-amd64.iso',
      shouldDownload: false
    },
    {
      size: 1999503360,
      downloaded: 199950336,
      fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
      path: 'ubuntu-18.10-desktop-amd64.iso2',
      shouldDownload: false
    }
  ]
};

describe('RtorrentTorrentItemComponent', () => {
  let component: RtorrentTorrentItemComponent;
  let fixture: ComponentFixture<RtorrentTorrentItemComponent>;
  let rtorrentTorrentsService: RtorrentTorrentsServiceMock;
  let dialog: MatDialog;

  beforeEach(async(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatProgressBarModule,
        MatMenuModule,
        TranslateModule,
        MatDialogModule,
        BytesSizeModule,
        BrowserAnimationsModule,
        BrowserModule
      ],
      declarations: [RtorrentTorrentItemComponent],
      providers: [
        { provide: RtorrentTorrentsService, useClass: RtorrentTorrentsServiceMock },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: MatDialog, useClass: MdDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RtorrentTorrentItemComponent);
    component = fixture.componentInstance;

    rtorrentTorrentsService = TestBed.get(RtorrentTorrentsService);
    rtorrentTorrentsService.component = component;

    dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.callThrough();

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

    // torrent active is true and complete is false => cloud_download
    component.torrent.completed = component.torrent.size / 4;
    component.torrent.downloaded = 0;
    component.torrent.complete = false;
    component.torrent.active = true;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(3);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('cloud_download');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '25'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '0'
    );
    // actions menu
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-content')).length).toBe(0);
    component.menuTrigger.openMenu();
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-content')).length).toBe(1);
    let menuContent = fixture.debugElement.queryAll(By.css('.mat-menu-content'))[0];
    expect(menuContent.queryAll(By.css('button')).length).toBe(3);
    expect(menuContent.queryAll(By.css('button'))[0].nativeElement.textContent).toBe(
      'pause[this is a fake translation of seed.pause]'
    );
    expect(menuContent.queryAll(By.css('button'))[1].nativeElement.textContent).toBe(
      'delete_forever[this is a fake translation of seed.erase]'
    );
    expect(menuContent.queryAll(By.css('button'))[2].nativeElement.textContent).toBe(
      'save_alt[this is a fake translation of seed.save_here]'
    );
    // pause the torrent
    menuContent.queryAll(By.css('button'))[0].nativeElement.click();

    // torrent active is false => pause
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(3);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('pause');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '25'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '0'
    );
    // actions menu
    component.menuTrigger.openMenu();
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-content')).length).toBe(2);
    menuContent = fixture.debugElement.queryAll(By.css('.mat-menu-content'))[1];
    expect(menuContent.queryAll(By.css('button')).length).toBe(3);
    expect(menuContent.queryAll(By.css('button'))[0].nativeElement.textContent).toBe(
      'play_arrow[this is a fake translation of seed.start]'
    );
    expect(menuContent.queryAll(By.css('button'))[1].nativeElement.textContent).toBe(
      'delete_forever[this is a fake translation of seed.erase]'
    );
    expect(menuContent.queryAll(By.css('button'))[2].nativeElement.textContent).toBe(
      'save_alt[this is a fake translation of seed.save_here]'
    );
    // active the torrent
    menuContent.queryAll(By.css('button'))[0].nativeElement.click();

    // torrent active is true and complete is false => cloud_download
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(3);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('cloud_download');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '25'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '0'
    );
    // actions menu
    component.menuTrigger.openMenu();
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-content')).length).toBe(3);
    menuContent = fixture.debugElement.queryAll(By.css('.mat-menu-content'))[2];
    expect(menuContent.queryAll(By.css('button')).length).toBe(3);
    expect(menuContent.queryAll(By.css('button'))[0].nativeElement.textContent).toBe(
      'pause[this is a fake translation of seed.pause]'
    );
    expect(menuContent.queryAll(By.css('button'))[1].nativeElement.textContent).toBe(
      'delete_forever[this is a fake translation of seed.erase]'
    );
    expect(menuContent.queryAll(By.css('button'))[2].nativeElement.textContent).toBe(
      'save_alt[this is a fake translation of seed.save_here]'
    );
    // switch "should save" of the torrent
    menuContent.queryAll(By.css('button'))[2].nativeElement.click();

    // torrent active is true and complete is true and downloaded is zero => save_alt (red)
    component.torrent.complete = true;
    component.torrent.completed = component.torrent.size;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(2);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('save_alt');
    expect(fixture.debugElement.query(By.css('.title mat-icon')).attributes['color']).toBe('warn');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '100'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '0'
    );
    // actions menu
    component.menuTrigger.openMenu();
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-content')).length).toBe(4);
    menuContent = fixture.debugElement.queryAll(By.css('.mat-menu-content'))[3];
    expect(menuContent.queryAll(By.css('button')).length).toBe(3);
    expect(menuContent.queryAll(By.css('button'))[0].nativeElement.textContent).toBe(
      'pause[this is a fake translation of seed.pause]'
    );
    expect(menuContent.queryAll(By.css('button'))[1].nativeElement.textContent).toBe(
      'delete_forever[this is a fake translation of seed.erase]'
    );
    expect(menuContent.queryAll(By.css('button'))[2].nativeElement.textContent).toBe(
      'block[this is a fake translation of seed.not_save_here]'
    );
    // switch "should save" of the torrent
    menuContent.queryAll(By.css('button'))[2].nativeElement.click();

    // torrent active is true and complete is true and downloaded is not zero => save_alt (not red)
    component.torrent.downloaded = component.torrent.size / 2;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(3);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('save_alt');
    expect(fixture.debugElement.query(By.css('.title mat-icon')).attributes['color']).toBe('primary');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '100'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '50'
    );
    // actions menu
    component.menuTrigger.openMenu();
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-content')).length).toBe(5);
    menuContent = fixture.debugElement.queryAll(By.css('.mat-menu-content'))[4];
    expect(menuContent.queryAll(By.css('button')).length).toBe(3);
    expect(menuContent.queryAll(By.css('button'))[0].nativeElement.textContent).toBe(
      'pause[this is a fake translation of seed.pause]'
    );
    expect(menuContent.queryAll(By.css('button'))[1].nativeElement.textContent).toBe(
      'delete_forever[this is a fake translation of seed.erase]'
    );
    expect(menuContent.queryAll(By.css('button'))[2].nativeElement.textContent).toBe(
      'save_alt[this is a fake translation of seed.save_here]'
    );
    component.menuTrigger.closeMenu();

    // torrent active is true and complete is true and downloaded is size => done
    component.torrent.downloaded = component.torrent.size;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(2);
    expect(fixture.debugElement.query(By.css('.title mat-icon')).nativeElement.textContent).toBe('done');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[0].attributes['ng-reflect-value']).toBe(
      '100'
    );
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[1].attributes['ng-reflect-value']).toBe(
      '100'
    );
    // actions menu
    component.menuTrigger.openMenu();
    expect(fixture.debugElement.queryAll(By.css('.mat-menu-content')).length).toBe(6);
    menuContent = fixture.debugElement.queryAll(By.css('.mat-menu-content'))[5];
    expect(menuContent.queryAll(By.css('button')).length).toBe(3);
    expect(menuContent.queryAll(By.css('button'))[0].nativeElement.textContent).toBe(
      'pause[this is a fake translation of seed.pause]'
    );
    expect(menuContent.queryAll(By.css('button'))[1].nativeElement.textContent).toBe(
      'delete_forever[this is a fake translation of seed.erase]'
    );
    expect(menuContent.queryAll(By.css('button'))[2].nativeElement.textContent).toBe(
      'save_alt[this is a fake translation of seed.save_here]'
    );
    // remove the torrent
    menuContent.queryAll(By.css('button'))[1].nativeElement.click();

    fixture.detectChanges();
    expect(dialog.open).toHaveBeenCalled();
    expect(component.torrent).toBeNull();
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

describe('RtorrentTorrentItemDialogComponent', () => {
  let component: RtorrentTorrentItemDialogComponent;
  let fixture: ComponentFixture<RtorrentTorrentItemDialogComponent>;
  let dialogRef: MatDialogRef<RtorrentTorrentItemDialogComponent>;

  beforeEach(async(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule, BrowserModule],
      declarations: [RtorrentTorrentItemDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useClass: MatDialogRefMock }
        //        { provide: RtorrentTorrentsService, useClass: RtorrentTorrentsServiceMock },
        //        { provide: TranslateService, useClass: TranslateServiceStub },
        //        {provide: MatDialog, useClass: MdDialogMock}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RtorrentTorrentItemDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('click should close the dialog', () => {
    dialogRef = TestBed.get(MatDialogRef);
    spyOn(dialogRef, 'close').and.callThrough();

    expect(fixture.debugElement.queryAll(By.css('button')).length).toBe(2);
    fixture.debugElement.queryAll(By.css('button'))[0].triggerEventHandler('click', null);
    expect(dialogRef.close).toHaveBeenCalled();
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

class RtorrentTorrentsServiceMock {
  component: RtorrentTorrentItemComponent;

  //noinspection JSUnusedLocalSymbols
  pauseTorrent(hash: string) {
    if (this.component.torrent) {
      this.component.torrent.active = false;
    }
  }

  //noinspection JSUnusedLocalSymbols
  startTorrent(hash: string) {
    if (this.component.torrent) {
      this.component.torrent.active = true;
    }
  }

  shouldGetFromSeeBox(hash: string, should: boolean) {
    if (this.component.torrent) {
      this.component.torrent.shouldDownload = should;
    }
  }

  //noinspection JSUnusedLocalSymbols
  removeTorrent(hash: string) {
    if (this.component.torrent) {
      this.component.torrent = null;
    }
  }
}

class TranslateServiceStub {
  //noinspection JSUnusedGlobalSymbols
  public onTranslationChange: EventEmitter<TranslationChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onLangChange: EventEmitter<LangChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onDefaultLangChange: EventEmitter<DefaultLangChangeEvent> = new EventEmitter();

  public use() {}

  //noinspection JSMethodCanBeStatic
  public get(key: any): any {
    return of('[this is a fake translation of ' + key + ']');
  }
}

export class MdDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of(true)
    };
  }
}

export class MatDialogRefMock {
  close() {}
}
