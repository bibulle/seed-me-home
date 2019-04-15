import { VersionInterceptor } from './version.interceptor';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';

describe('VersionInterceptor', () => {
  let interceptor: VersionInterceptor;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [VersionInterceptor]
    }).compile();

    interceptor = app.get<VersionInterceptor>(VersionInterceptor);
  });

  it('should be defined', () => {
    expect(new VersionInterceptor()).toBeDefined();

    // injected should be defined
    expect(interceptor).toBeDefined();
  });

  it('intercept should add version beside data', async done => {
    const next = {
      handle() {
        return of({ data: { un: 'un', deux: 2 } });
      }
    };
    jest.spyOn(next, 'handle');

    await interceptor.intercept(null, next);

    expect(jest.spyOn(next, 'handle')).toHaveBeenCalledTimes(1);

    await interceptor.intercept(null, next).subscribe(
      value => {
        expect(value.version).toBeDefined();
        expect(value.version).toMatch(/^[0-9]+[.][0-9]+[.][0-9]$/);
        expect(value.data).toEqual({ un: 'un', deux: 2 });

        done();
      },
      error => {
        expect(error).toBeNull();
      }
    );
  });

  it('intercept should add data level if not exists', async done => {
    const next = {
      handle() {
        return of({ un: 'un', deux: 2 });
      }
    };
    jest.spyOn(next, 'handle');

    await interceptor.intercept(null, next);

    expect(jest.spyOn(next, 'handle')).toHaveBeenCalledTimes(1);

    await interceptor.intercept(null, next).subscribe(
      value => {
        expect(value.data).toEqual({ un: 'un', deux: 2 });

        done();
      },
      error => {
        expect(error).toBeNull();
      }
    );
  });
});
