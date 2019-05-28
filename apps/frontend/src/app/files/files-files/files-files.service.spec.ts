import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationModule, NotificationService } from '../../notification/notification.service';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';
import { TranslateModule } from '@ngx-translate/core';
import { FilesFilesService } from './files-files.service';

const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

describe('FilesFilesService', () => {
  let service: FilesFilesService;
  let notificationService: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule, NotificationModule, TranslateModule.forRoot()],
      providers: [NotificationService, { provide: NGXLogger, useClass: NGXLoggerMock }]
    });
    service = TestBed.get(FilesFilesService);
    notificationService = TestBed.get(NotificationService);
    httpMock = TestBed.get(HttpTestingController);

    jest.useFakeTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFiles', () => {
    const goodAnswer1 = {
      data: {
        path: 'dir1',
        fullpath: 'downloaded_test/dir1',
        size: 100000,
        downloaded: 10000,
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
            children: []
          }
        ]
      }
    };
    const goodAnswer2 = {
      data: {
        path: 'dir1',
        fullpath: 'downloaded_test/dir1',
        size: 100000,
        downloaded: 50000,
        isDirectory: true,
        modifiedDate: new Date(0),
        children: [
          {
            path: 'dir1/file1',
            fullpath: 'downloaded_test/dir1/file1',
            size: 100000,
            downloaded: 50000,
            isDirectory: false,
            modifiedDate: new Date(5),
            children: []
          }
        ]
      }
    };

    it('should do nothing if none has subscribed to the event', () => {
      service.startLoadingStats(true);

      httpMock.expectNone(`${service.API_URL_LOCAL}`);
      httpMock.expectNone(`${service.API_URL_NAS}`);

      jest.clearAllTimers();
    });

    it('should return a value if someone subscribe the local event and refresh 10 second later', async () => {
      // This should test the content of the service return
      let callCptLocal = 0;
      service.currentFilesObservableLocal().subscribe(files => {
        if (callCptLocal % 2 === 0) {
          expect(files).toEqual(goodAnswer1.data);
        } else {
          expect(files).toEqual(goodAnswer2.data);
        }
        callCptLocal++;
      });

      let callCptNas = 0;
      service.currentFilesObservableNas().subscribe(files => {
        if (callCptNas % 2 === 0) {
          expect(files).toEqual(goodAnswer1.data);
        } else {
          expect(files).toEqual(goodAnswer2.data);
        }
        callCptNas++;
      });

      // start
      service.startLoadingStats(true);

      // immediately get url called
      let req = httpMock.expectOne(`${service.API_URL_LOCAL}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer1);
      req = httpMock.expectOne(`${service.API_URL_NAS}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer1);

      // timeout has been called
      await flushPromises();

      // No new request (because we wait 10 seconds)
      httpMock.expectNone(`${service.API_URL_LOCAL}`);
      httpMock.expectNone(`${service.API_URL_NAS}`);

      // Activate the timeout
      jest.runOnlyPendingTimers();

      // immediately get url called
      req = httpMock.expectOne(`${service.API_URL_LOCAL}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer2);
      req = httpMock.expectOne(`${service.API_URL_NAS}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer2);

      jest.clearAllTimers();
    });

    it('should manage error if http response is Ko (and update after a while)', async () => {
      // Just test the error content
      jest.spyOn(notificationService, 'error').mockImplementation(message => {
        expect(message).toBe('Tested http error');
      });

      // Just do nothing but subscribe
      service.currentFilesObservableLocal().subscribe(() => {});

      // start the service
      service.startLoadingStats(true);

      // immediately get url called (and answer error)
      let req = httpMock.expectOne(`${service.API_URL_LOCAL}`);
      expect(req.request.method).toBe('GET');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error'
        })
      );
      req = httpMock.expectOne(`${service.API_URL_NAS}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer1);

      // timeout has been called
      await flushPromises();
      expect(setTimeout).toHaveBeenCalledTimes(1);

      // No new request (because we wait 10 seconds)
      httpMock.expectNone(`${service.API_URL_LOCAL}`);
      httpMock.expectNone(`${service.API_URL_NAS}`);

      // Activate the timeout
      jest.runOnlyPendingTimers();

      // immediately get url called
      req = httpMock.expectOne(`${service.API_URL_LOCAL}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer1);
      req = httpMock.expectOne(`${service.API_URL_NAS}`);
      expect(req.request.method).toBe('GET');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error'
        })
      );

      // Notification service should have been called twice
      await flushPromises();
      expect(jest.spyOn(notificationService, 'error')).toHaveBeenCalledTimes(2);

      jest.clearAllTimers();
    });
  });

  describe('removeFile', () => {
    it('should say ok if http return ok', async () => {
      expect.assertions(2);

      service
        .removeFile('/path')
        .then(() => {
          expect(true).toBe(true);
        })
        .catch(() => {
          expect(true).toBe(false);
        });

      // immediately get url called
      const req = httpMock.expectOne(`${service.API_URL_REMOVE}`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should say ko if http return ko', async () => {
      expect.assertions(4);

      jest.spyOn(notificationService, 'error').mockImplementation(message => {
        expect(message).toBe('Tested http error');
      });

      service
        .removeFile('/path')
        .then(() => {
          expect(true).toBe(false);
        })
        .catch(() => {
          expect(true).toBe(true);
        });

      // immediately get url called
      const req = httpMock.expectOne(`${service.API_URL_REMOVE}`);
      expect(req.request.method).toBe('POST');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error'
        })
      );

      await flushPromises();
      expect(jest.spyOn(notificationService, 'error')).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateTrgPath', () => {
    it('should should transform movie name', function() {
      expect(service.calculateTrgPath('Test.title.2010.BdRip MULTI-VOSTFR.mkv')).toEqual({
        sourcePath: 'Test.title.2010.BdRip MULTI-VOSTFR.mkv',
        targetPath: 'Test title (2010).mkv',
        targetType: 0
      });
    });
    it('should should transform series name', function() {
      expect(service.calculateTrgPath('A series.s5e3-An.episode.mkv')).toEqual({
        sourcePath: 'A series.s5e3-An.episode.mkv',
        targetPath: 'A series/Season 5/A series S05E03 An episode.mkv',
        targetType: 1
      });
      expect(service.calculateTrgPath('A series.s5e3.mkv')).toEqual({
        sourcePath: 'A series.s5e3.mkv',
        targetPath: 'A series/Season 5/A series S05E03.mkv',
        targetType: 1
      });
      expect(service.calculateTrgPath('A series 5x3.mkv')).toEqual({
        sourcePath: 'A series 5x3.mkv',
        targetPath: 'A series/Season 5/A series S05E03.mkv',
        targetType: 1
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpMock.verify();
    jest.clearAllTimers();
  });
});
