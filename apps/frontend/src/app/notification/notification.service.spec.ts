import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';
import { DefaultLangChangeEvent, LangChangeEvent, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';

describe('NotificationService', () => {
  let service: NotificationService;
  let aSnackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, BrowserAnimationsModule, NoopAnimationsModule],
      providers: [
        { provide: NGXLogger, useClass: NGXLoggerMock },
        { provide: TranslateService, useClass: TranslateServiceStub }
      ]
    });
    aSnackBar = TestBed.get(MatSnackBar);
    service = TestBed.get(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('error method should console and notify (error)', async () => {
    const _aSnackBarOpen = jest.spyOn(aSnackBar, 'open');
    _aSnackBarOpen.mockImplementationOnce((message, actions, config) => {
      expect(_aSnackBarOpen).toBeCalledTimes(1);
      expect(message).toEqual('This is a test message');
      expect(config).toBeDefined();
      expect(config.panelClass).toEqual(['error']);

      return aSnackBar.open(message, actions, config);
    });

    service.error('This is a test message');
  });

  it('error method should translate if needed', async () => {
    const _aSnackBarOpen = jest.spyOn(aSnackBar, 'open');
    _aSnackBarOpen.mockImplementationOnce((message, actions, config) => {
      expect(_aSnackBarOpen).toBeCalledTimes(1);
      expect(message).toEqual('[this is a fake translation of This is a test message]');
      expect(config).toBeDefined();
      expect(config.panelClass).toEqual(['error']);

      return aSnackBar.open(message, actions, config);
    });

    service.error('This is a test message | translate');
  });

  it('error method should add args if needed', async () => {
    const _aSnackBarOpen = jest.spyOn(aSnackBar, 'open');
    _aSnackBarOpen.mockImplementationOnce((message, actions, config) => {
      expect(_aSnackBarOpen).toBeCalledTimes(1);
      expect(message).toEqual('This is a test message - {"1":1} - ["two","three"]');
      expect(config).toBeDefined();
      expect(config.panelClass).toEqual(['error']);

      return aSnackBar.open(message, actions, config);
    });

    service.error('This is a test message', { 1: 1 }, ['two', 'three']);
  });

  it('handleError should manage HttpErrorResponse containing ErrorEvent and error message', async () => {
    const errorEvent = new HttpErrorResponse({
      error: new ErrorEvent('HTTP_ERROR', {
        error: new Error('Http error'),
        message: 'Tested http error (ErrorEvent)'
      })
    });

    const notificationServiceErrorMock = jest.spyOn(service, 'error');
    notificationServiceErrorMock.mockImplementation(mess => {
      expect(mess).toEqual('Tested http error (ErrorEvent)');
    });

    try {
      service.handleError(errorEvent);
    } catch (e) {
      console.error(e);
    }

    expect(notificationServiceErrorMock).toHaveBeenCalledTimes(1);

    notificationServiceErrorMock.mockClear();
  });

  it('handleError should manage HttpErrorResponse not containing ErrorEvent and error message', async () => {
    const errorEvent = new HttpErrorResponse({ statusText: 'Tested http error' });

    const notificationServiceErrorMock = jest.spyOn(service, 'error');
    notificationServiceErrorMock.mockImplementation(mess => {
      expect(mess).toEqual('Tested http error | translate');
    });

    try {
      service.handleError(errorEvent);
    } catch (e) {
      console.error(e);
    }

    expect(notificationServiceErrorMock).toHaveBeenCalledTimes(1);

    notificationServiceErrorMock.mockClear();
  });
});
class TranslateServiceStub {
  //noinspection JSUnusedGlobalSymbols
  public onTranslationChange: EventEmitter<TranslationChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onLangChange: EventEmitter<LangChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onDefaultLangChange: EventEmitter<DefaultLangChangeEvent> = new EventEmitter();
  public use() {}
  //noinspection JSMethodCanBeStatic
  public get(key: any): any {
    return of('[this is a fake translation of ' + key + ']');
  }
}
