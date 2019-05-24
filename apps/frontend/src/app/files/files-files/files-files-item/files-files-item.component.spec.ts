import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesFilesItemComponent, FilesFilesItemDialogComponent } from './files-files-item.component';
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
import { FilesFile } from '@seed-me-home/models';
import * as moment from 'moment';
import { EventEmitter } from '@angular/core';
import { FilesFilesService } from '../files-files.service';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const files1: FilesFile = {
  path: 'dir1',
  fullpath: 'downloaded_test/dir1',
  size: 500000,
  downloaded: 210000,
  isDirectory: true,
  modifiedDate: new Date(0),
  children: [
    {
      path: 'file1',
      fullpath: 'downloaded_test/dir1/file1',
      size: 100000,
      downloaded: 10000,
      isDirectory: false,
      modifiedDate: new Date(2),
      children: []
    },
    {
      path: 'dir2',
      fullpath: 'downloaded_test/dir1/dir2',
      size: 200000,
      downloaded: 0,
      isDirectory: true,
      modifiedDate: new Date(1),
      children: [
        {
          path: 'file2_1',
          fullpath: 'downloaded_test/dir1/dir2/file2_1',
          size: 200000,
          downloaded: 0,
          isDirectory: false,
          modifiedDate: new Date(4),
          children: []
        }
      ]
    }
  ]
};

describe('FilesFilesItemComponent', () => {
  let component: FilesFilesItemComponent;
  let fixture: ComponentFixture<FilesFilesItemComponent>;
  let filesFilesService: FilesFilesServiceMock;
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
      declarations: [FilesFilesItemComponent],
      providers: [
        { provide: FilesFilesService, useClass: FilesFilesServiceMock },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: MatDialog, useClass: MdDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesFilesItemComponent);
    component = fixture.componentInstance;

    filesFilesService = TestBed.get(FilesFilesService);
    filesFilesService.component = component;

    dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display items value', () => {
    component.file = files1;
    //@ts-ignore : Test on rest API get string instead of Dates
    component.file.children[1].children[0].modifiedDate = '2019-05-24T11:34:35.159Z';

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.title')).length).toBe(4);
    expect(fixture.debugElement.queryAll(By.css('.title span'))[0].nativeElement.textContent).toBe(files1.path);
    expect(fixture.debugElement.queryAll(By.css('.title span'))[1].nativeElement.textContent).toBe(
      files1.children[0].path
    );
    expect(fixture.debugElement.queryAll(By.css('.title span'))[2].nativeElement.textContent).toBe(
      files1.children[1].path
    );
    expect(fixture.debugElement.queryAll(By.css('.title span'))[3].nativeElement.textContent).toBe(
      files1.children[1].children[0].path
    );

    expect(fixture.debugElement.queryAll(By.css('.size')).length).toBe(4);
    expect(fixture.debugElement.query(By.css('.size')).nativeElement.textContent).toBe(
      (files1.size / 1024).toFixed(2) + ' KB'
    );

    expect(fixture.debugElement.queryAll(By.css('.date')).length).toBe(4);
    expect(fixture.debugElement.query(By.css('.date')).nativeElement.textContent).toBe(
      moment.utc(files1.modifiedDate).format('lll')
    );
  });

  it('should display directory closed and open it on click', () => {
    component.file = files1;

    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(8);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[0].nativeElement.textContent).toBe('chevron_right');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.textContent).toBe('chevron_right');

    expect(fixture.debugElement.queryAll(By.css('.children')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.children.open')).length).toBe(0);

    fixture.debugElement.queryAll(By.css('.title mat-icon'))[0].nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.children.open')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[0].nativeElement.textContent).toBe('expand_more');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.textContent).toBe('chevron_right');

    fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.children.open')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[0].nativeElement.textContent).toBe('expand_more');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.textContent).toBe('expand_more');

    fixture.debugElement.queryAll(By.css('.title mat-icon'))[0].nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.children.open')).length).toBe(1);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[0].nativeElement.textContent).toBe('chevron_right');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.textContent).toBe('expand_more');
  });

  it('icon before name should be the right one', () => {
    component.file = files1;

    // directory downloaded => warn chevron_right
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(8);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.textContent).toBe('chevron_right');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].attributes['ng-reflect-color']).toBe('warn');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[2].attributes['ng-reflect-value']).toBe(
      '0'
    );

    // file not downloaded => warn save_alt
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(8);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[6].nativeElement.textContent).toBe('save_alt');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[6].attributes['ng-reflect-color']).toBe('warn');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[3].attributes['ng-reflect-value']).toBe(
      '0'
    );

    // file started downloaded => primary save_alt
    component.file.children[1].children[0].downloaded = component.file.children[1].children[0].size / 4;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(8);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[6].nativeElement.textContent).toBe('save_alt');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[6].attributes['ng-reflect-color']).toBe('primary');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[3].attributes['ng-reflect-value']).toBe(
      '25'
    );

    // file finished downloaded => primary done
    component.file.children[1].children[0].downloaded = component.file.children[1].children[0].size;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(8);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[6].nativeElement.textContent).toBe('done');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[6].attributes['ng-reflect-color']).toBe('primary');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[3].attributes['ng-reflect-value']).toBe(
      '100'
    );

    // directory started downloaded => primary chevron_right
    component.file.children[1].downloaded = component.file.children[1].size / 4;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(8);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.textContent).toBe('chevron_right');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].attributes['ng-reflect-color']).toBe('warn');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[2].attributes['ng-reflect-value']).toBe(
      '25'
    );

    // directory finished downloaded => primary chevron_right
    component.file.children[1].downloaded = component.file.children[1].size;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon')).length).toBe(8);
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].nativeElement.textContent).toBe('chevron_right');
    expect(fixture.debugElement.queryAll(By.css('.title mat-icon'))[4].attributes['ng-reflect-color']).toBe('primary');
    expect(fixture.debugElement.queryAll(By.css('.progress mat-progress-bar'))[2].attributes['ng-reflect-value']).toBe(
      '100'
    );
  });
});

describe('FilesFilesItemDialogComponent', () => {
  let component: FilesFilesItemDialogComponent;
  let fixture: ComponentFixture<FilesFilesItemDialogComponent>;
  let dialogRef: MatDialogRef<FilesFilesItemDialogComponent>;

  beforeEach(async(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule, BrowserModule],
      declarations: [FilesFilesItemDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useClass: MatDialogRefMock }
        //        { provide: FilesFilesService, useClass: FilesFilesServiceMock },
        //        { provide: TranslateService, useClass: TranslateServiceStub },
        //        {provide: MatDialog, useClass: MdDialogMock}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesFilesItemDialogComponent);
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

class FilesFilesServiceMock {
  component: FilesFilesItemComponent;

  //  //noinspection JSUnusedLocalSymbols
  //  pauseTorrent (hash: string) {
  //    if (this.component.torrent) {
  //      this.component.torrent.active = false;
  //    }
  //  }
  //
  //  //noinspection JSUnusedLocalSymbols
  //  startTorrent (hash: string) {
  //    if (this.component.torrent) {
  //      this.component.torrent.active = true;
  //    }
  //  }
  //
  //  shouldGetFromSeeBox (hash: string, should: boolean) {
  //    if (this.component.torrent) {
  //      this.component.torrent.shouldDownload = should;
  //    }
  //  }
  //
  //  //noinspection JSUnusedLocalSymbols
  //  removeTorrent (hash: string) {
  //    if (this.component.torrent) {
  //      this.component.torrent = null;
  //    }
  //  }
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
