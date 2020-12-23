import { JwtHelperServiceService, UserService } from './user.service';
import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import {
  NotificationModule,
  NotificationService,
} from '../notification/notification.service';
import { NGXLogger } from 'ngx-logger';
import { NGXLoggerMock } from 'ngx-logger/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('UserService', () => {
  let service: UserService;
  let jwtHelper: JwtHelperService;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;
  let translateService: TranslateService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NotificationModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        UserService,
        NotificationService,
        { provide: NGXLogger, useClass: NGXLoggerMock },
      ],
    });

    // use to test what append iif config saved is KO
    localStorage.setItem('config', '{wrong json');

    jwtHelper = TestBed.get(JwtHelperServiceService).getJwtHelper();
    httpMock = TestBed.get(HttpTestingController);
    notificationService = TestBed.get(NotificationService);
    translateService = TestBed.get(TranslateService);

    // spy on jwtHelperService
    jest.spyOn(jwtHelper, 'isTokenExpired').mockImplementation((token) => {
      // console.log('JwtHelperService isTokenExpired');
      return token !== 'not-expired' && token !== 'not-expired-admin';
    });
    jest.spyOn(jwtHelper, 'decodeToken').mockImplementation((token) => {
      // console.log('JwtHelperService decodeToken');
      if (token === 'not-expired') {
        return { firstName: 'not', lastName: 'expired', providerId: 'foo bar' };
      } else if (token === 'not-expired-admin') {
        return {
          firstName: 'not',
          lastName: 'expired',
          providerId: 'foo bar',
          isAdmin: true,
        };
      } else {
        return { firstName: 'is', lastName: 'expired' };
      }
    });
  });

  afterEach(() => {
    localStorage.clear();
    service = null;
  });

  it('should be defined', () => {
    service = TestBed.get(UserService);

    expect(service).toBeDefined();
  });

  describe('Authentication', () => {
    it('check authentication should change user', (done) => {
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      // for now, user should be empty
      expect(user).toEqual({});

      // change the local storage
      localStorage.setItem('id_token', 'not-expired');

      // call the checkAuthentication method, and it should change the user
      expect(service.checkAuthentication()).toEqual(true);
      expect(user).toEqual({
        firstName: 'not',
        lastName: 'expired',
        providerId: 'foo bar',
      });

      done();
    });

    it('check authentication should not change user with notEmit param', (done) => {
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      // for now, user should be empty
      service.checkAuthentication();
      expect(user).toEqual({});

      // change the local storage
      localStorage.setItem('id_token', 'not-expired');

      // call the checkAuthentication method, and it should change the user
      expect(service.checkAuthentication(false)).toEqual(true);
      expect(user).toEqual({});

      done();
    });

    it('Authentication should be tested every 3 second', fakeAsync(() => {
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      // Service has start, user should be {} (and not authenticate)
      expect(user).toEqual({});
      expect(service.isAuthenticate()).toEqual(false);

      // change the local storage, still have not changed user (till 3 seconds)
      localStorage.setItem('id_token', 'not-expired');
      expect(user).toEqual({});

      tick(3000);

      // After 3 seconds, user has changed (and we are authenticated)
      expect(user).toEqual({
        firstName: 'not',
        lastName: 'expired',
        providerId: 'foo bar',
      });
      expect(service.isAuthenticate()).toEqual(true);

      // Alter the local storage (nothing change)
      localStorage.setItem('id_token', 'is-expired');
      expect(user).toEqual({
        firstName: 'not',
        lastName: 'expired',
        providerId: 'foo bar',
      });

      // Call the isAuthenticate method, everything should have changed
      expect(service.isAuthenticate()).toEqual(false);
      expect(user).toEqual({});

      discardPeriodicTasks();
    }));
  });

  describe('Google authentication', () => {
    it('Check login process (to google)', fakeAsync(() => {
      jest.useFakeTimers();
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      //Object.defineProperty(window, 'open', jest.fn());

      let urlWindowOpen = null;
      let newWindow = null;
      jest.spyOn(window, 'open').mockImplementation((url) => {
        //console.log('window.open ' + url);
        urlWindowOpen = url;

        newWindow = {
          close: () => {},
        };

        return newWindow;
      });

      service
        .startLoginGoogle()
        .then(() => {
          // console.log('expect');
        })
        .catch((err) => {
          // console.log('catch');
          expect(err).toBeNull();
        });

      tick();

      expect(urlWindowOpen).toEqual(
        `${environment.serverUrl}authentication/google`
      );

      jest.advanceTimersByTime(200);

      // the url change to be google answer
      Object.defineProperty(newWindow, 'location', {
        value: {
          href: '/assets/logged.html?code=google-token',
        },
      });

      jest.advanceTimersByTime(200);

      const req = httpMock.expectOne(
        environment.serverUrl +
          'authentication/google/callback?code=google-token'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: { id_token: 'not-expired' } });

      tick();

      expect(user).toEqual({
        firstName: 'not',
        lastName: 'expired',
        providerId: 'foo bar',
      });
      expect(service.isAuthenticate()).toEqual(true);
    }));

    it('Check login process (to google) with no answer from google', fakeAsync(() => {
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      let urlWindowOpen = null;
      let newWindow = null;
      jest.spyOn(window, 'open').mockImplementation((url) => {
        // console.log('window.open ' + url);
        urlWindowOpen = url;

        newWindow = {
          close: () => {},
        };

        return newWindow;
      });
      jest.spyOn(window, 'close').mockImplementation(() => {
        // console.log('window.close');
      });

      service
        .startLoginGoogle()
        .then(() => {
          // console.log('expect');
        })
        .catch((err) => {
          expect(err).toEqual('Time out');
          discardPeriodicTasks();
        });

      expect(urlWindowOpen).toEqual(
        `${environment.serverUrl}authentication/google`
      );

      tick(200);

      // the url change to be google answer
      //Object.defineProperty(newWindow, 'location', {
      //  value: {
      //    href: '/assets/logged.html?NO-CODE'
      //  }
      //});

      tick(650 * 100);
    }));

    it('Check login process (to google) with error from google', fakeAsync(() => {
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      let urlWindowOpen = null;
      let newWindow = null;
      jest.spyOn(window, 'open').mockImplementation((url) => {
        // console.log('window.open ' + url);
        urlWindowOpen = url;

        newWindow = {
          close: () => {},
        };

        return newWindow;
      });
      jest.spyOn(window, 'close').mockImplementation(() => {
        // console.log('window.close');
      });

      service
        .startLoginGoogle()
        .then(() => {
          // console.log('expect');
        })
        .catch((err) => {
          expect(err).toEqual('Something go wrong');
          discardPeriodicTasks();
        });

      expect(urlWindowOpen).toEqual(
        `${environment.serverUrl}authentication/google`
      );

      tick(200);

      // the url change to be google answer
      Object.defineProperty(newWindow, 'location', {
        value: {
          href: '/assets/logged.html?error_message=Something+go+wrong',
        },
      });

      tick(500);
    }));

    it('Check login process (to google) with error from backend', fakeAsync(() => {
      service = TestBed.get(UserService);

      // Just test the error content
      jest.spyOn(notificationService, 'error').mockImplementation((message) => {
        expect(message).toEqual('callback error');
      });

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      let urlWindowOpen = null;
      let newWindow = null;
      jest.spyOn(window, 'open').mockImplementation((url) => {
        // console.log('window.open ' + url);
        urlWindowOpen = url;

        newWindow = {
          close: () => {},
        };

        return newWindow;
      });
      jest.spyOn(window, 'close').mockImplementation(() => {
        // console.log('window.close');
      });

      service
        .startLoginGoogle()
        .then(() => {
          expect(true).toEqual(false);
        })
        .catch(() => {
          expect(true).toEqual(true);
          discardPeriodicTasks();
        });

      expect(urlWindowOpen).toEqual(
        `${environment.serverUrl}authentication/google`
      );

      tick(200);

      // the url change to be google answer
      Object.defineProperty(newWindow, 'location', {
        value: {
          href: '/assets/logged.html?code=google-token',
        },
      });

      tick(200);

      const req = httpMock.expectOne(
        environment.serverUrl +
          'authentication/google/callback?code=google-token'
      );
      expect(req.request.method).toBe('GET');
      req.error(
        new ErrorEvent('callback error', { message: 'callback error' })
      );
    }));
  });

  describe('other methods : logout, admin, ...', () => {
    it('should logout when called', (done) => {
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      // change the local storage and check authent, we should be logged
      localStorage.setItem('id_token', 'not-expired');
      expect(service.checkAuthentication()).toEqual(true);
      expect(user).toEqual({
        firstName: 'not',
        lastName: 'expired',
        providerId: 'foo bar',
      });

      // then logout
      service.logout();

      expect(localStorage.getItem('id_token')).toBeNull();
      expect(user).toEqual({});

      done();
    });

    it("should tell whether it's an logged admin or not", (done) => {
      service = TestBed.get(UserService);

      let user = null;
      service.userObservable().subscribe((userReceived) => {
        // console.log(userReceived);
        user = userReceived;
      });

      // for now, user should be empty
      expect(user).toEqual({});
      expect(service.isAdminAuthenticate()).toBe(false);

      // change the local storage and check authent, we should be logged but not admin
      localStorage.setItem('id_token', 'not-expired');
      expect(service.checkAuthentication()).toEqual(true);
      expect(user).toEqual({
        firstName: 'not',
        lastName: 'expired',
        providerId: 'foo bar',
      });
      expect(service.isAdminAuthenticate()).toBe(false);

      // change the local storage and check authent, we should be logged but not admin
      localStorage.setItem('id_token', 'not-expired-admin');
      expect(service.checkAuthentication()).toEqual(true);
      expect(user).toEqual({
        firstName: 'not',
        lastName: 'expired',
        providerId: 'foo bar',
        isAdmin: true,
      });
      expect(service.isAdminAuthenticate()).toBe(true);

      // then logout
      service.logout();

      expect(localStorage.getItem('id_token')).toBeNull();
      expect(user).toEqual({});
      expect(service.isAdminAuthenticate()).toBe(false);

      done();
    });
  });

  describe('config management', () => {
    it('language change should change language and saved config', (done) => {
      service = TestBed.get(UserService);

      let config = null;
      service.configObservable().subscribe((configReceived) => {
        // console.log(userReceived);
        config = configReceived;
      });

      // for now, config.language should be default value 'en'
      expect(config).toBeDefined();
      expect(config).toMatchObject(
        expect.objectContaining({ language: expect.any(String) })
      );
      expect(config.language).toBe('en');
      expect(translateService.currentLang).toBe('en');

      // update it
      service.changeLanguage('fr');
      expect(config.language).toBe('fr');
      expect(translateService.currentLang).toBe('fr');

      // update it
      service.changeLanguage('ru');
      expect(config.language).toBe('ru');
      expect(translateService.currentLang).toBe('ru');

      done();
    });
  });
});
