import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePath, FilesFilesComponent } from './files-files.component';
import { FilesFilesService } from './files-files.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Observable, Subject } from 'rxjs';
import { FilesFile } from '@seed-me-home/models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';
import { FilesFilesItemModule } from './files-files-item/files-files-item.component';
import { NGXLogger } from 'ngx-logger';
import { NGXLoggerMock } from 'ngx-logger/testing';

describe('FilesFilesComponent', () => {
  let component: FilesFilesComponent;
  let fixture: ComponentFixture<FilesFilesComponent>;
  let filesFilesService: FilesFilesServiceMock;
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
        FilesFilesItemModule,
      ],
      declarations: [FilesFilesComponent],
      providers: [
        { provide: FilesFilesService, useClass: FilesFilesServiceMock },
        { provide: NGXLogger, useClass: NGXLoggerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesFilesComponent);
    component = fixture.componentInstance;

    filesFilesService = TestBed.get(FilesFilesService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filesFiles should be update if local', () => {
    const goodAnswer: FilesFile = {
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: [],
          downloadStarted: new Date(3),
        },
        {
          path: 'dir1/dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 201000,
          downloaded: 201000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'dir1/dir2/file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/file2_2',
              fullpath: 'downloaded_test/dir1/dir2/file2_2',
              size: 1000,
              downloaded: 1000,
              isDirectory: false,
              modifiedDate: new Date(4),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/error_file',
              fullpath: 'downloaded_test/dir1/dir2/error_file',
              size: 0,
              downloaded: 0,
              isDirectory: false,
              modifiedDate: null,
              children: [],
              downloadStarted: new Date(3),
            },
          ],
          downloadStarted: new Date(3),
        },
      ],
      downloadStarted: new Date(3),
    };

    component.filePath = FilePath.Local;

    component.ngOnInit();
    expect(component.filesFiles).toBeUndefined();

    // we should have subscribe
    expect(filesFilesService.files$.observers.length).toBe(1);

    filesFilesService.files$.next(goodAnswer);
    fixture.detectChanges();
    expect(component.filesFiles).toEqual(goodAnswer);

    // after destroy, we should unsubscribe
    component.ngOnDestroy();
    // TODO : due to rxjs bug, commented code
    //expect(filesFilesService.files$.observers.length).toBe(0);
  });

  it('filesFiles should be update if nas', () => {
    const goodAnswer1: FilesFile = {
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 300000,
      downloaded: 210000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: [],
          downloadStarted: new Date(3),
        },
        {
          path: 'dir1/dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 200000,
          downloaded: 200000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'dir1/dir2/file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: [],
              downloadStarted: new Date(3),
            },
          ],
          downloadStarted: new Date(3),
        },
      ],
      downloadStarted: new Date(3),
    };
    const goodAnswer2: FilesFile = {
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: [],
          downloadStarted: new Date(3),
        },
        {
          path: 'dir1/dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 201000,
          downloaded: 201000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'dir1/dir2/file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/file2_2',
              fullpath: 'downloaded_test/dir1/dir2/file2_2',
              size: 1000,
              downloaded: 1000,
              isDirectory: false,
              modifiedDate: new Date(4),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/error_file',
              fullpath: 'downloaded_test/dir1/dir2/error_file',
              size: 0,
              downloaded: 0,
              isDirectory: false,
              modifiedDate: null,
              children: [],
              downloadStarted: new Date(3),
            },
          ],
          downloadStarted: new Date(3),
        },
      ],
      downloadStarted: new Date(3),
    };
    const goodAnswer3: FilesFile = {
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 300000,
      downloaded: 210000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: [],
          downloadStarted: new Date(3),
        },
        {
          path: 'dir1/dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 200000,
          downloaded: 200000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'dir1/dir2/file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: [],
              downloadStarted: new Date(3),
            },
          ],
          downloadStarted: new Date(3),
        },
      ],
      downloadStarted: new Date(3),
    };

    component.filePath = FilePath.Nas;

    component.ngOnInit();
    expect(component.filesFiles).toBeUndefined();

    // we should have subscribe
    expect(filesFilesService.files$.observers.length).toBe(1);

    filesFilesService.files$.next(goodAnswer1);
    fixture.detectChanges();
    expect(component.filesFiles).toEqual(goodAnswer1);

    filesFilesService.files$.next(goodAnswer2);
    fixture.detectChanges();
    expect(component.filesFiles).toEqual(goodAnswer2);

    filesFilesService.files$.next(goodAnswer3);
    fixture.detectChanges();
    expect(component.filesFiles).toEqual(goodAnswer3);

    // after destroy, we should unsubscribe
    component.ngOnDestroy();
    // TODO : due to rxjs bug, commented code
    //expect(filesFilesService.files$.observers.length).toBe(0);
  });

  it('should remove file if service OK', async () => {
    jest.spyOn(filesFilesService, 'removeFile').mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    });

    // No error if filesFiles not set
    expect(component.filesFiles).toBeFalsy();
    await component.removeFile({
      path: 'dir1/dir2/file2_1',
      fullpath: 'downloaded_test/dir1/dir2/file2_1',
      size: 200000,
      downloaded: 200000,
      isDirectory: false,
      modifiedDate: new Date(3),
      children: [],
      downloadStarted: new Date(3),
    });

    // File should be removed if OK
    component.filesFiles = {
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: [],
          downloadStarted: new Date(3),
        },
        {
          path: 'dir1/dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 201000,
          downloaded: 201000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'dir1/dir2/file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/file2_2',
              fullpath: 'downloaded_test/dir1/dir2/file2_2',
              size: 1000,
              downloaded: 1000,
              isDirectory: false,
              modifiedDate: new Date(4),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/error_file',
              fullpath: 'downloaded_test/dir1/dir2/error_file',
              size: 0,
              downloaded: 0,
              isDirectory: false,
              modifiedDate: null,
              children: [],
              downloadStarted: new Date(3),
            },
          ],
          downloadStarted: new Date(3),
        },
      ],
      downloadStarted: new Date(3),
    };

    expect(component.filesFiles).toBeTruthy();
    expect(component.filesFiles.children.length).toBe(2);
    expect(component.filesFiles.children[1].children.length).toBe(3);
    expect(component.filesFiles.children[1].children[0].path).toBe(
      'dir1/dir2/file2_1'
    );

    await component.removeFile({
      path: 'dir1/dir2/file2_1',
      fullpath: 'downloaded_test/dir1/dir2/file2_1',
      size: 200000,
      downloaded: 200000,
      isDirectory: false,
      modifiedDate: new Date(3),
      children: [],
      downloadStarted: new Date(3),
    });

    expect(component.filesFiles).toBeTruthy();
    expect(component.filesFiles.children.length).toBe(2);
    expect(component.filesFiles.children[1].children.length).toBe(2);
    expect(component.filesFiles.children[1].children[0].path).toBe(
      'dir1/dir2/file2_2'
    );
  });

  it('should not remove file if service KO', async () => {
    jest.spyOn(filesFilesService, 'removeFile').mockImplementation(() => {
      return new Promise((resolve, reject) => {
        reject();
      });
    });

    // File should be removed if OK
    component.filesFiles = {
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: [],
          downloadStarted: new Date(3),
        },
        {
          path: 'dir1/dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 201000,
          downloaded: 201000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'dir1/dir2/file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/file2_2',
              fullpath: 'downloaded_test/dir1/dir2/file2_2',
              size: 1000,
              downloaded: 1000,
              isDirectory: false,
              modifiedDate: new Date(4),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/error_file',
              fullpath: 'downloaded_test/dir1/dir2/error_file',
              size: 0,
              downloaded: 0,
              isDirectory: false,
              modifiedDate: null,
              children: [],
              downloadStarted: new Date(3),
            },
          ],
          downloadStarted: new Date(3),
        },
      ],
      downloadStarted: new Date(3),
    };

    expect(component.filesFiles).toBeTruthy();
    expect(component.filesFiles.children.length).toBe(2);
    expect(component.filesFiles.children[1].children.length).toBe(3);
    expect(component.filesFiles.children[1].children[0].path).toBe(
      'dir1/dir2/file2_1'
    );

    await component.removeFile({
      path: 'dir1/dir2/file2_1',
      fullpath: 'downloaded_test/dir1/dir2/file2_1',
      size: 200000,
      downloaded: 200000,
      isDirectory: false,
      modifiedDate: new Date(3),
      children: [],
      downloadStarted: new Date(3),
    });

    expect(component.filesFiles).toBeTruthy();
    expect(component.filesFiles.children.length).toBe(2);
    expect(component.filesFiles.children[1].children.length).toBe(3);
    expect(component.filesFiles.children[1].children[0].path).toBe(
      'dir1/dir2/file2_1'
    );
  });

  it('toggle sort should do the job', () => {
    const goodAnswer: FilesFile = {
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: [],
          downloadStarted: new Date(3),
        },
        {
          path: 'dir1/dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 201000,
          downloaded: 201000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'dir1/dir2/file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/file2_2',
              fullpath: 'downloaded_test/dir1/dir2/file2_2',
              size: 1000,
              downloaded: 1000,
              isDirectory: false,
              modifiedDate: new Date(4),
              children: [],
              downloadStarted: new Date(3),
            },
            {
              path: 'dir1/dir2/error_file',
              fullpath: 'downloaded_test/dir1/dir2/error_file',
              size: 0,
              downloaded: 0,
              isDirectory: false,
              modifiedDate: null,
              children: [],
              downloadStarted: new Date(3),
            },
          ],
          downloadStarted: new Date(3),
        },
      ],
      downloadStarted: new Date(3),
    };

    component.filePath = FilePath.Local;
    component.ngOnInit();
    filesFilesService.files$.next(goodAnswer);
    fixture.detectChanges();

    // default values
    expect(component.sortItem).toBe('date');
    expect(component.sortDirection).toBe('desc');
    expect(component.filesFiles.children[0].modifiedDate).toEqual(new Date(2));

    // after a click, order should be inverted
    component.toggleSort('date');
    expect(component.sortItem).toBe('date');
    expect(component.sortDirection).toBe('asc');
    expect(component.filesFiles.children[0].modifiedDate).toEqual(new Date(1));

    // after a click, order should be re-inverted
    component.toggleSort('date');
    expect(component.sortItem).toBe('date');
    expect(component.sortDirection).toBe('desc');
    expect(component.filesFiles.children[0].modifiedDate).toEqual(new Date(2));

    // after a click on another button, order should be different
    component.toggleSort('size');
    expect(component.sortItem).toBe('size');
    expect(component.sortDirection).toBe('desc');
    expect(component.filesFiles.children[0].size).toBe(201000);
    component.toggleSort('size');
    expect(component.sortItem).toBe('size');
    expect(component.sortDirection).toBe('asc');
    expect(component.filesFiles.children[0].size).toBe(100000);

    // after a click on another button, order should be different
    component.toggleSort('progress');
    expect(component.sortItem).toBe('progress');
    expect(component.sortDirection).toBe('desc');
    expect(component.filesFiles.children[0].downloaded).toBe(201000);
    component.toggleSort('progress');
    expect(component.sortItem).toBe('progress');
    expect(component.sortDirection).toBe('asc');
    expect(component.filesFiles.children[0].downloaded).toBe(10000);
  });
});

class FilesFilesServiceMock {
  files$: Subject<FilesFile> = new Subject<FilesFile>();

  //noinspection JSUnusedGlobalSymbols
  currentFilesObservableLocal(): Observable<FilesFile> {
    return this.files$;
  }
  //noinspection JSUnusedGlobalSymbols
  currentFilesObservableNas(): Observable<FilesFile> {
    return this.files$;
  }
  startLoadingStats() {}
  removeFile() {}
  calculateTrgPath() {}
}
