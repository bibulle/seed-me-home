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

    it('it should do nothing if none has subscribed to the event', () => {
      service.startLoadingStats(true);

      httpMock.expectNone(`${service.API_URL_LOCAL}`);
      httpMock.expectNone(`${service.API_URL_NAS}`);

      jest.clearAllTimers();
    });

    it('it should return a value if someone subscribe the local event and refresh 10 second later', async () => {
      // This should test the content of the service return
      let callCpt = 0;
      service.currentFilesObservableLocal().subscribe(files => {
        if (callCpt % 2 === 0) {
          expect(files).toEqual(goodAnswer1.data);
        } else {
          expect(files).toEqual(goodAnswer2.data);
        }
        callCpt++;
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

    it('it should manage error if http response is Ko (and update after a while)', async () => {
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

  afterEach(() => {
    httpMock.verify();
    jest.clearAllTimers();
  });
});
