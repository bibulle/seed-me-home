import { RefreshTokenInterceptor } from './refresh-token.interceptor';
import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpResponse } from '@angular/common/http';
import { UserService } from '../user/user.service';
import { of } from 'rxjs';

describe('RefreshTokenInterceptor', () => {
  let interceptor: RefreshTokenInterceptor;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefreshTokenInterceptor, { provide: UserService, useClass: UserServiceMock }]
    }).compileComponents();

    interceptor = TestBed.get(RefreshTokenInterceptor);
    userService = TestBed.get(UserService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should set the token if response contains refreshtoken', async () => {
    jest.spyOn(UserService, 'tokenSetter').mockImplementation(() => {});
    jest.spyOn(userService, 'checkAuthentication');

    const next: HttpHandler = {
      handle() {
        return of(
          new HttpResponse({
            body: { refreshToken: 'a refreshToken' }
          })
        );
      }
    };

    await interceptor.intercept(null, next).subscribe();

    expect(jest.spyOn(UserService, 'tokenSetter')).toHaveBeenCalledTimes(1);
    expect(jest.spyOn(UserService, 'tokenSetter')).toBeCalledWith('a refreshToken');
  });
});

class UserServiceMock {
  checkAuthentication() {}
}
