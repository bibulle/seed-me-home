import { LoggingInterceptor } from './logging.interceptor';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [LoggingInterceptor]
    }).compile();

    interceptor = app.get<LoggingInterceptor>(LoggingInterceptor);
  });

  it('should be defined', () => {
    expect(new LoggingInterceptor()).toBeDefined();

    // injected should be defined
    expect(interceptor).toBeDefined();
  });

  it('intercept should log before and after (without changing the result)', async done => {
    const next = {
      handle() {
        return of({ data: { un: 'un', deux: 2 } });
      }
    };
    const handler = function() {};

    jest.spyOn(next, 'handle');

    //    await interceptor.intercept(new ExecutionContextHost(null, this.constructor, handler), next);
    //
    //    expect(jest.spyOn(next, 'handle')).toHaveBeenCalledTimes(1);

    await interceptor.intercept(new ExecutionContextHost(null, this.constructor, handler), next).subscribe(
      value => {
        expect(value).toEqual({ data: { un: 'un', deux: 2 } });

        done();
      },
      error => {
        expect(error).toBeNull();
      }
    );
  });
});
