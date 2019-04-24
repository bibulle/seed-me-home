import { TestBed } from '@angular/core/testing';

import { RtorrentTorrentsService } from './rtorrent-torrents.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationModule, NotificationService } from '../notification/notification.service';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';

const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

describe('RtorrentTorrentsService', () => {
  let service: RtorrentTorrentsService;
  let notificationService: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule, NotificationModule],
      providers: [NotificationService, { provide: NGXLogger, useClass: NGXLoggerMock }]
    });
    service = TestBed.get(RtorrentTorrentsService);
    notificationService = TestBed.get(NotificationService);
    httpMock = TestBed.get(HttpTestingController);

    jest.useFakeTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStatus', () => {
    const goodAnswer1 = {
      data: {
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
      }
    };
    const goodAnswer2 = {
      data: {
        hash: '5A8CE26E8A19A877D8CCC927FCC18E34E1F5FF67',
        path: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso',
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
        files: [
          {
            size: '1999503360',
            fullpath: '/home/14user/rutorrent/torrents/ubuntu-18.10-desktop-amd64.iso'
          }
        ]
      }
    };

    it('it should do nothing if none has subscribed to the event', () => {
      service.startLoadingTorrents(true);

      httpMock.expectNone(`${service.API_URL}`);

      jest.clearAllTimers();
    });

    it('it should return a value if someone subscribe the event and refresh 10 second later', async () => {
      // This should test the content of the service return
      let callCpt = 0;
      service.currentTorrentsObservable().subscribe(status => {
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
      jest.spyOn(notificationService, 'error').mockImplementation(message => {
        expect(message).toBe('Tested http error');
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
          message: 'Tested http error'
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
