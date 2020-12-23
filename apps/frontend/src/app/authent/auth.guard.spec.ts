import { AuthGuard, AuthGuardAdmin } from './auth.guard';
import { UserService } from '../user/user.service';
import { TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { NGXLoggerMock } from 'ngx-logger/testing';
import { NotificationService } from '../notification/notification.service';

describe('AuthGuard', () => {
  let service: AuthGuard;
  let userService: UserService;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AuthGuard,
        { provide: NGXLogger, useClass: NGXLoggerMock },
        { provide: UserService, useClass: UserServiceMock },
      ],
    });
    service = TestBed.get(AuthGuard);
    userService = TestBed.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('can activate ok if already authenticate', () => {
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => true);

    expect.assertions(1);
    service.canActivate().then((value) => {
      expect(value).toEqual(true);
    });
  });

  it('can activate ok if not already authenticate and google logging work', () => {
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => false);
    jest.spyOn(userService, 'startLoginGoogle').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolve();
        })
    );

    expect.assertions(1);
    service.canActivate().then((value) => {
      expect(value).toEqual(true);
    });
  });

  it('can activate KO if not already authenticate and google logging do not work', () => {
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => false);
    jest.spyOn(userService, 'startLoginGoogle').mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          reject('login error');
        })
    );

    expect.assertions(1);
    service.canActivate().then((ret) => {
      expect(ret).toEqual(false);
    });
  });
});

describe('AuthGuardAdmin', () => {
  let service: AuthGuardAdmin;
  let userService: UserService;
  let notificationService: NotificationService;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AuthGuardAdmin,
        { provide: NGXLogger, useClass: NGXLoggerMock },
        { provide: UserService, useClass: UserServiceMock },
        { provide: NotificationService, useClass: NotificationServiceMock },
      ],
    });
    service = TestBed.get(AuthGuardAdmin);
    userService = TestBed.get(UserService);
    notificationService = TestBed.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('can activate ok if already authenticate and admin', () => {
    jest
      .spyOn(userService, 'isAdminAuthenticate')
      .mockImplementation(() => true);
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => true);

    expect.assertions(1);
    service.canActivate().then((value) => {
      expect(value).toEqual(true);
    });
  });

  it('can activate KO if already authenticate and not admin', () => {
    jest
      .spyOn(userService, 'isAdminAuthenticate')
      .mockImplementation(() => false);
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => true);

    expect.assertions(1);
    service.canActivate().then((value) => {
      expect(value).toEqual(false);
    });
  });

  it('can activate OK if not already authenticate and google logging do work', () => {
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => false);
    jest
      .spyOn(userService, 'isAdminAuthenticate')
      .mockImplementation(() => true);
    jest.spyOn(userService, 'startLoginGoogle').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolve();
        })
    );

    expect.assertions(1);

    service.canActivate().then((ret) => {
      expect(ret).toEqual(true);
    });
  });

  it('can activate KO if not already authenticate and google logging do work and not administrator', () => {
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => false);
    jest
      .spyOn(userService, 'isAdminAuthenticate')
      .mockImplementation(() => false);
    jest.spyOn(userService, 'startLoginGoogle').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolve();
        })
    );

    expect.assertions(1);

    service.canActivate().then((ret) => {
      expect(ret).toEqual(false);
    });
  });

  it('can activate KO if not already authenticate and google logging do not work', () => {
    jest
      .spyOn(userService, 'isAdminAuthenticate')
      .mockImplementation(() => false);
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => false);
    jest.spyOn(userService, 'startLoginGoogle').mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          reject('login error');
        })
    );

    expect.assertions(1);
    service.canActivate().then((ret) => {
      expect(ret).toEqual(false);
    });
  });
});

class UserServiceMock {
  //noinspection JSMethodCanBeStatic
  isAuthenticate(): Boolean {
    return false;
  }

  //noinspection JSMethodCanBeStatic
  isAdminAuthenticate(): Boolean {
    return false;
  }

  //noinspection JSMethodCanBeStatic
  startLoginGoogle(): Promise<void> {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}

class NotificationServiceMock {
  //noinspection JSUnusedLocalSymbols
  error(err: string, ...args: any[]) {}
}
