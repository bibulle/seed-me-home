import { TestBed } from '@angular/core/testing';

import { RtorrentTorrentsService } from './rtorrent-torrents.service';
import { HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NotificationService } from '../../notification/notification.service';
import { NGXLogger } from 'ngx-logger';
import { NGXLoggerMock } from 'ngx-logger/testing';
import { ApiReturn, RtorrentTorrent } from '@seed-me-home/models';
import { throwError } from 'rxjs';
import Spy = jasmine.Spy;

const flushPromises = () => {
  return new Promise((resolve) => setImmediate(resolve));
};

describe('RtorrentTorrentsService', () => {
  let service: RtorrentTorrentsService;
  let notificationService: NotificationService;
  let httpMock: HttpTestingController;
  let notificationSpy: Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [
        { provide: NotificationService, useClass: NotificationServiceMock },
        { provide: NGXLogger, useClass: NGXLoggerMock },
      ],
    });
    service = TestBed.get(RtorrentTorrentsService);
    notificationService = TestBed.get(NotificationService);
    httpMock = TestBed.get(HttpTestingController);

    notificationSpy = spyOn(
      notificationService,
      'handleError'
    ).and.callThrough();

    jest.useFakeTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTorrents', () => {
    const goodAnswer1: ApiReturn = {
      version: { version: '1.3' },
      data: [
        {
          hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
          path:
            '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
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
          downloaded: 12345,
          shouldDownload: false,
          active: true,
          open: true,
          downloadStarted: new Date(2),
          files: [
            {
              size: 1999503360,
              path: 'ubuntu-18.10-desktop-amd64.iso',
              fullpath:
                '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
              downloaded: 12345,
              shouldDownload: false,
              downloadStarted: new Date(2),
            },
          ],
        },
      ],
      refreshToken: 'A refresh token',
    };
    const goodAnswer2: ApiReturn = {
      version: { version: '1.3' },
      data: [
        {
          hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
          path:
            '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
          name: 'ubuntu-18.10-desktop-amd64.iso',
          size: 1999503360,
          completed: 1999503360,
          down_rate: 0,
          down_total: 1196652654,
          up_rate: 123,
          up_total: 1234,
          createdAt: 1539860537,
          addtime: 1552911761,
          complete: true,
          leechers: 5,
          seeders: 80,
          ratio: 0.1,
          downloaded: 12345,
          shouldDownload: false,
          active: true,
          open: true,
          downloadStarted: new Date(2),
          files: [
            {
              size: 1999503360,
              path: 'ubuntu-18.10-desktop-amd64.iso',
              fullpath:
                '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
              downloaded: 12345,
              shouldDownload: false,
              downloadStarted: new Date(2),
            },
          ],
        },
      ],
      refreshToken: 'A refresh token',
    };

    it('it should do nothing if none has subscribed to the event', () => {
      service.startLoadingTorrents(true);

      httpMock.expectNone(`${service.API_URL}`);

      jest.clearAllTimers();
    });

    it('it should return a value if someone subscribe the event and refresh 10 second later', async () => {
      // This should test the content of the service return
      let callCpt = 0;
      service.currentTorrentsObservable().subscribe((status) => {
        if (callCpt % 2 === 0) {
          expect(status).toEqual(goodAnswer1.data);
        } else {
          expect(status).toEqual(goodAnswer2.data);
        }
        callCpt++;
      });

      // start
      service.startLoadingTorrents(true);

      // immediately get url called
      let req = httpMock.expectOne(`${service.API_URL}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer1);

      // timeout has been called
      await flushPromises();

      // No new request (because we wait 10 seconds)
      httpMock.expectNone(`${service.API_URL}`);

      // Activate the timeout
      jest.runOnlyPendingTimers();

      // immediately get url called
      req = httpMock.expectOne(`${service.API_URL}`);
      expect(req.request.method).toBe('GET');
      req.flush(goodAnswer2);

      jest.clearAllTimers();
    });

    it('it should manage error if http response is Ko (and update after a while)', async () => {
      // Just test the error content
      jest
        .spyOn(notificationService, 'handleError')
        .mockImplementation((message) => {
          expect(message).toBeTruthy();
          expect(message.name).toBe('HttpErrorResponse');
          return throwError(message);
        });

      // Just do nothing but subscribe
      service.currentTorrentsObservable().subscribe(() => {});

      // start the service
      service.startLoadingTorrents(true);

      // immediately get url called (and answer error)
      let req = httpMock.expectOne(`${service.API_URL}`);
      expect(req.request.method).toBe('GET');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error',
        })
      );

      // timeout has been called
      await flushPromises();
      expect(setTimeout).toHaveBeenCalledTimes(1);

      // No new request (because we wait 10 seconds)
      httpMock.expectNone(`${service.API_URL}`);

      // Activate the timeout
      jest.runOnlyPendingTimers();

      // immediately get url called
      req = httpMock.expectOne(`${service.API_URL}`);
      expect(req.request.method).toBe('GET');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error',
        })
      );

      // Notification service should have been called twice
      await flushPromises();
      expect(
        jest.spyOn(notificationService, 'handleError')
      ).toHaveBeenCalledTimes(2);

      jest.clearAllTimers();
    });
  });

  describe('torrents actions', () => {
    const goodAnswer1: ApiReturn = {
      version: { version: '1.3' },
      data: [
        {
          hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
          path:
            '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
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
          downloaded: 12345,
          shouldDownload: false,
          active: true,
          open: true,
          downloadStarted: new Date(2),
          files: [
            {
              size: 1999503360,
              path: 'ubuntu-18.10-desktop-amd64.iso',
              fullpath:
                '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
              downloaded: 12345,
              shouldDownload: false,
              downloadStarted: new Date(2),
            },
          ],
        },
      ],
      refreshToken: 'A refresh token',
    };

    it('should pause torrents', async () => {
      let torrents: RtorrentTorrent[] = null;
      service.currentTorrentsObservable().subscribe((_torrents) => {
        torrents = _torrents;
      });

      expect(torrents).toBeNull();
      // let's go
      service.pauseTorrent('5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67');

      let req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67/pause`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(goodAnswer1);

      await flushPromises();
      expect(torrents).toBe(goodAnswer1.data);

      // what if http error
      service.pauseTorrent('5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67');

      req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67/pause`
      );
      expect(req.request.method).toBe('PUT');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error',
        })
      );

      // Notification service should have been called
      await flushPromises();
      expect(notificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should start torrents', async () => {
      let torrents: RtorrentTorrent[] = null;
      service.currentTorrentsObservable().subscribe((_torrents) => {
        torrents = _torrents;
      });

      expect(torrents).toBeNull();
      // let's go
      service.startTorrent('5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67');

      let req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67/start`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(goodAnswer1);

      await flushPromises();
      expect(torrents).toBe(goodAnswer1.data);

      // what if http error
      service.startTorrent('5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67');

      req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67/start`
      );
      expect(req.request.method).toBe('PUT');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error',
        })
      );

      // Notification service should have been called
      await flushPromises();
      expect(notificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should remove torrents', async () => {
      let torrents: RtorrentTorrent[] = null;
      service.currentTorrentsObservable().subscribe((_torrents) => {
        torrents = _torrents;
      });

      expect(torrents).toBeNull();
      // let's go
      service.removeTorrent('5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67');

      let req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(goodAnswer1);

      await flushPromises();
      expect(torrents).toBe(goodAnswer1.data);

      // what if http error
      service.removeTorrent('5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67');

      req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67`
      );
      expect(req.request.method).toBe('DELETE');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error',
        })
      );

      // Notification service should have been called
      await flushPromises();
      expect(notificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should switch "should download" for torrents', async () => {
      let torrents: RtorrentTorrent[] = null;
      service.currentTorrentsObservable().subscribe((_torrents) => {
        torrents = _torrents;
      });

      expect(torrents).toBeNull();
      // let's go
      service.shouldGetFromSeeBox(
        '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
        true
      );

      let req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67/shouldDownload/true`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(goodAnswer1);

      await flushPromises();
      expect(torrents).toBe(goodAnswer1.data);

      // what if http error
      service.shouldGetFromSeeBox(
        '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
        false
      );

      req = httpMock.expectOne(
        `${service.API_URL}/5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67/shouldDownload/false`
      );
      expect(req.request.method).toBe('PUT');
      req.error(
        new ErrorEvent('HTTP_ERROR', {
          error: new Error('Http error'),
          message: 'Tested http error',
        })
      );

      // Notification service should have been called
      await flushPromises();
      expect(notificationSpy).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });
});

class NotificationServiceMock {
  val = Math.random();
  //noinspection JSUnusedLocalSymbols
  handleError(error) {}
}
