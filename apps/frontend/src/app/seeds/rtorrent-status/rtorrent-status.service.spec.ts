import { TestBed } from '@angular/core/testing';

import { RtorrentStatusService } from './rtorrent-status.service';
import { HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  NotificationModule,
  NotificationService,
} from '../../notification/notification.service';
import { NGXLogger } from 'ngx-logger';
import { NGXLoggerMock } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';

const flushPromises = () => {
  return new Promise((resolve) => setImmediate(resolve));
};

describe('RtorrentStatusService', () => {
  let service: RtorrentStatusService;
  let notificationService: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        NotificationModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        NotificationService,
        { provide: NGXLogger, useClass: NGXLoggerMock },
      ],
    });
    service = TestBed.get(RtorrentStatusService);
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
        down_rate: '28',
        down_total: '463360286085',
        up_rate: '191',
        up_total: '1293694778894',
        free_disk_space: 24319991808,
      },
    };
    const goodAnswer2 = {
      data: {
        down_rate: '29',
        down_total: '463360286085',
        up_rate: '191',
        up_total: '1293694778894',
        free_disk_space: 24319991808,
      },
    };

    it('it should do nothing if none has subscribed to the event', () => {
      service.startLoadingStats(true);

      httpMock.expectNone(`${service.API_URL}`);

      jest.clearAllTimers();
    });

    it('it should return a value if someone subscribe the event and refresh 10 second later', async () => {
      // This should test the content of the service return
      let callCpt = 0;
      service.currentStatusObservable().subscribe((status) => {
        if (callCpt % 2 === 0) {
          expect(status).toEqual(goodAnswer1.data);
        } else {
          expect(status).toEqual(goodAnswer2.data);
        }
        callCpt++;
      });

      // start
      service.startLoadingStats(true);

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
      jest.spyOn(notificationService, 'error').mockImplementation((message) => {
        expect(message).toBe('Tested http error');
      });

      // Just do nothing but subscribe
      service.currentStatusObservable().subscribe(() => {});

      // start the service
      service.startLoadingStats(true);

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
      expect(jest.spyOn(notificationService, 'error')).toHaveBeenCalledTimes(2);

      jest.clearAllTimers();
    });
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllTimers();
  });
});
