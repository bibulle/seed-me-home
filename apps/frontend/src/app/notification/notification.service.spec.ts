import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationService', () => {
  let service: NotificationService;
  let aSnackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, BrowserAnimationsModule, NoopAnimationsModule]
    });
    service = TestBed.get(NotificationService);
    aSnackBar = TestBed.get(MatSnackBar);
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

    NotificationService.error('This is a test message');
  });

  it('handleError should manage HttpErrorResponse containing ErrorEvent and error message', async () => {
    const errorEvent = new HttpErrorResponse({
      error: new ErrorEvent('HTTP_ERROR', {
        error: new Error('Http error'),
        message: 'Tested http error (ErrorEvent)'
      })
    });

    const notificationServiceErrorMock = jest.spyOn(NotificationService, 'error');
    notificationServiceErrorMock.mockImplementation(mess => {
      expect(mess).toEqual('Tested http error (ErrorEvent)');
    });

    try {
      NotificationService.handleError(errorEvent);
    } catch (e) {
      console.error(e);
    }

    expect(notificationServiceErrorMock).toHaveBeenCalledTimes(1);

    notificationServiceErrorMock.mockClear();
  });

  it('handleError should manage HttpErrorResponse not containing ErrorEvent and error message', async () => {
    const errorEvent = new HttpErrorResponse({
      statusText: 'Tested http error'
    });

    const notificationServiceErrorMock = jest.spyOn(NotificationService, 'error');
    notificationServiceErrorMock.mockImplementation(mess => {
      expect(mess).toEqual('Tested http error');
    });

    try {
      NotificationService.handleError(errorEvent);
    } catch (e) {
      console.error(e);
    }

    expect(notificationServiceErrorMock).toHaveBeenCalledTimes(1);

    notificationServiceErrorMock.mockClear();
  });
});
