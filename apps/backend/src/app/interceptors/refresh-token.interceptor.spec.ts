import { RefreshTokenInterceptor } from './refresh-token.interceptor';
import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConfigService } from '../../services/config/config.service';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

describe('RefreshTokenInterceptor', () => {
  let interceptor: RefreshTokenInterceptor;
  let configService: ConfigService;

  beforeEach(async () => {
    configService = new ConfigService();
    configService.forceConfigFile('env-model.json');

    const app = await Test.createTestingModule({
      imports: [],
      providers: [{ provide: ConfigService, useValue: configService }, RefreshTokenInterceptor, AuthenticationService]
    }).compile();

    interceptor = app.get<RefreshTokenInterceptor>(RefreshTokenInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('intercept should work', async () => {
    const dataMock = {
      status: 'Here is a status'
    };

    const next: CallHandler = {
      handle() {
        return of(dataMock);
      }
    };

    // data should be unchanged if expiration date is more than 10 minutes
    let context = getContextMock(11, 'unauthorized user');
    interceptor
      .intercept(<ExecutionContext>context, next)
      .pipe(
        map(data => {
          expect(data).toEqual(dataMock);
          return data;
        })
      )
      .subscribe();

    // data should change if expiration date is less than 10 minutes
    context = getContextMock(9, 'unauthorized user');
    interceptor
      .intercept(<ExecutionContext>context, next)
      .pipe(
        map(async data => {
          data.then(d => {
            expect(d).toBeTruthy();
            expect(d.data).toEqual(dataMock);
            expect(d.refreshToken).toBeUndefined();
          });
          return data;
        })
      )
      .subscribe();

    // data should change if expiration date is less than 10 minutes
    context = getContextMock(9, 'authorized user');
    interceptor
      .intercept(<ExecutionContext>context, next)
      .pipe(
        map(async data => {
          data.then(d => {
            expect(d).toBeTruthy();
            expect(d.data).toEqual(dataMock);
            expect(d.refreshToken).toBeTruthy();
          });
          return data;
        })
      )
      .subscribe();
  });
});

function getExpiration(minutesBeforeExpiration: number): number {
  const nowSeconds = new Date().valueOf() / 1000;

  return nowSeconds + minutesBeforeExpiration * 60;
}

function getContextMock(minutesBeforeExpiration: number, userName: string) {
  return {
    switchToHttp() {
      return {
        getRequest() {
          return {
            user: {
              name: userName,
              exp: getExpiration(minutesBeforeExpiration)
            }
          };
        }
      };
    }
  };
}
