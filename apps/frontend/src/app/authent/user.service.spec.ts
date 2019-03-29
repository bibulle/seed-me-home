import { JwtHelperServiceService, UserModule, UserService } from './user.service';
import { TestBed } from '@angular/core/testing';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import * as _Window from 'jsdom/lib/jsdom/browser/Window';
import { NotificationModule, NotificationService } from '../notification/notification.service';

const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

describe('UserService', () => {
  let service: UserService;
  let jwtHelper: JwtHelperService;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;

  jest.useFakeTimers();

  beforeAll(async () => {
    TestBed.configureTestingModule({
      imports: [UserModule, HttpClientTestingModule, NotificationModule],
      providers: [NotificationService]
    });
    service = TestBed.get(UserService);
    jwtHelper = TestBed.get(JwtHelperServiceService).getJwtHelper();
    httpMock = TestBed.get(HttpTestingController);
    notificationService = TestBed.get(NotificationService);

    // spy on jwtHelperService
    jest.spyOn(jwtHelper, 'isTokenExpired').mockImplementation(token => {
      // console.log('JwtHelperService isTokenExpired');
      return token !== 'not-expired';
    });
    jest.spyOn(jwtHelper, 'decodeToken').mockImplementation(token => {
      // console.log('JwtHelperService decodeToken');
      if (token === 'not-expired') {
        return { firstName: 'not', lastName: 'expired', providerId: 'foo bar' };
      } else {
        return { firstName: 'is', lastName: 'expired' };
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Authentication should be tested every 3 second', done => {
    let user = null;
    service.userObservable().subscribe(userReceived => {
      // console.log(userReceived);
      user = userReceived;
    });

    // Service has start, user should be {} (and not authenticate)
    expect(user).toEqual({});
    expect(service.isAuthenticate()).toEqual(false);

    // change the local storage, still have not changed user (till 3 seconds)
    localStorage.setItem('id_token', 'not-expired');
    expect(user).toEqual({});

    jest.advanceTimersByTime(3000);

    // After 3 seconds, user has changed (and we are authenticated)
    expect(user).toEqual({ firstName: 'not', lastName: 'expired', providerId: 'foo bar' });
    expect(service.isAuthenticate()).toEqual(true);

    // Alter the local storage (nothing change)
    localStorage.setItem('id_token', 'is-expired');
    expect(user).toEqual({ firstName: 'not', lastName: 'expired', providerId: 'foo bar' });

    // Call the isAuthenticate method, everything should have changed
    expect(service.isAuthenticate()).toEqual(false);
    expect(user).toEqual({});

    done();
  });

  it('Check login process (to google)', async done => {
    let user = null;
    service.userObservable().subscribe(userReceived => {
      // console.log(userReceived);
      user = userReceived;
    });

    let urlWindowOpen = null;
    let newWindow = null;
    jest.spyOn(window, 'open').mockImplementation(url => {
      // console.log('window.open ' + url);
      urlWindowOpen = url;

      newWindow = new _Window({ parsingMode: 'html' });

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
      .catch(err => {
        // console.log('catch');
        expect(err).toBeNull();
      });

    expect(urlWindowOpen).toEqual(`${environment.serverUrl}authentication/google`);

    jest.advanceTimersByTime(200);

    // the url change to be google answer
    Object.defineProperty(newWindow, 'location', {
      value: {
        href: '/assets/logged.html?code=google-token'
      }
    });

    jest.advanceTimersByTime(200);

    const req = httpMock.expectOne(environment.serverUrl + 'authentication/google/callback?code=google-token');
    expect(req.request.method).toBe('GET');
    req.flush({ id_token: 'not-expired' });

    await flushPromises();

    expect(user).toEqual({ firstName: 'not', lastName: 'expired', providerId: 'foo bar' });
    expect(service.isAuthenticate()).toEqual(true);

    done();
  });

  it('Check login process (to google) with no answer from google', async done => {
    let user = null;
    service.userObservable().subscribe(userReceived => {
      // console.log(userReceived);
      user = userReceived;
    });

    let urlWindowOpen = null;
    let newWindow = null;
    jest.spyOn(window, 'open').mockImplementation(url => {
      // console.log('window.open ' + url);
      urlWindowOpen = url;

      newWindow = new _Window({ parsingMode: 'html' });

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
      .catch(err => {
        expect(err).toEqual('Time out');
        done();
      });

    expect(urlWindowOpen).toEqual(`${environment.serverUrl}authentication/google`);

    jest.advanceTimersByTime(200);

    // the url change to be google answer
    //Object.defineProperty(newWindow, 'location', {
    //  value: {
    //    href: '/assets/logged.html?NO-CODE'
    //  }
    //});

    jest.advanceTimersByTime(650 * 100);
  });

  it('Check login process (to google) with error from google', async done => {
    let user = null;
    service.userObservable().subscribe(userReceived => {
      // console.log(userReceived);
      user = userReceived;
    });

    let urlWindowOpen = null;
    let newWindow = null;
    jest.spyOn(window, 'open').mockImplementation(url => {
      // console.log('window.open ' + url);
      urlWindowOpen = url;

      newWindow = new _Window({ parsingMode: 'html' });

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
      .catch(err => {
        expect(err).toEqual('Something go wrong');
        done();
      });

    expect(urlWindowOpen).toEqual(`${environment.serverUrl}authentication/google`);

    jest.advanceTimersByTime(200);

    // the url change to be google answer
    Object.defineProperty(newWindow, 'location', {
      value: {
        href: '/assets/logged.html?error_message=Something+go+wrong'
      }
    });

    jest.advanceTimersByTime(500);
  });

  it('Check login process (to google) with error from backend', async done => {
    // Just test the error content
    jest.spyOn(notificationService, 'error').mockImplementation(message => {
      expect(message).toEqual('callback error');
    });

    let user = null;
    service.userObservable().subscribe(userReceived => {
      // console.log(userReceived);
      user = userReceived;
    });

    let urlWindowOpen = null;
    let newWindow = null;
    jest.spyOn(window, 'open').mockImplementation(url => {
      // console.log('window.open ' + url);
      urlWindowOpen = url;

      newWindow = new _Window({ parsingMode: 'html' });

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
      });

    expect(urlWindowOpen).toEqual(`${environment.serverUrl}authentication/google`);

    jest.advanceTimersByTime(200);

    // the url change to be google answer
    Object.defineProperty(newWindow, 'location', {
      value: {
        href: '/assets/logged.html?code=google-token'
      }
    });

    jest.advanceTimersByTime(200);

    const req = httpMock.expectOne(environment.serverUrl + 'authentication/google/callback?code=google-token');
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent('callback error', { message: 'callback error' }));

    await flushPromises();

    done();
  });
});
