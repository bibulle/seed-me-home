import { AuthGuard } from './auth.guard';
import { UserModule, UserService } from './user.service';
import { TestBed } from '@angular/core/testing';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';

describe('AuthGuard', () => {
  let service: AuthGuard;
  let userService: UserService;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      imports: [UserModule],
      providers: [AuthGuard, { provide: NGXLogger, useClass: NGXLoggerMock }]
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
    service.canActivate().then(value => {
      expect(value).toEqual(true);
    });
  });

  it('can activate ok if not already authenticate and google logging work', () => {
    jest.spyOn(userService, 'isAuthenticate').mockImplementation(() => false);
    jest.spyOn(userService, 'startLoginGoogle').mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolve();
        })
    );

    expect.assertions(1);
    service.canActivate().then(value => {
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
    service.canActivate().catch(error => {
      expect(error).toEqual('login error');
    });
  });
});
