import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageLog, MessageLogLevel } from '@seed-me-home/models';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;
  let consoleDebug = '';
  let consoleWarn = '';
  let consoleError = '';

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService]
    }).compile();

    appController = app.get<AppController>(AppController);

    consoleDebug = '';
    consoleWarn = '';
    consoleError = '';
    jest.spyOn(appController.logger, 'debug').mockImplementation(mess => {
      consoleDebug = mess;
    });
    jest.spyOn(appController.logger, 'warn').mockImplementation(mess => {
      consoleWarn = mess;
    });
    jest.spyOn(appController.logger, 'error').mockImplementation(mess => {
      consoleError = mess;
    });
  });

  describe('createLog', () => {
    it('a received TRACE log should create the correct debug log', () => {
      const message: MessageLog = {
        message: 'a message',
        level: MessageLogLevel.TRACE,
        timestamp: new Date(),
        fileName: 'filename.ts?',
        lineNumber: '123',
        additional: [{ un: '1' }]
      };
      expect(appController.createLog(message)).toEqual(message);

      expect(consoleDebug).toEqual('a message {"un":"1"}');
      expect(consoleWarn).toEqual('');
      expect(consoleError).toEqual('');
    });
    it('a received DEBUG log should create the correct debug log', () => {
      const message: MessageLog = {
        message: 'a message',
        level: MessageLogLevel.DEBUG,
        timestamp: new Date(),
        fileName: 'filename.ts?',
        lineNumber: '123',
        additional: null
      };
      expect(appController.createLog(message)).toEqual(message);

      expect(consoleDebug).toEqual('a message');
      expect(consoleWarn).toEqual('');
      expect(consoleError).toEqual('');
    });
    it('a received INFO log should create the correct debug log', () => {
      const message: MessageLog = {
        message: 'a message',
        level: MessageLogLevel.INFO,
        timestamp: new Date(),
        fileName: 'filename.ts?',
        lineNumber: '123',
        additional: null
      };
      expect(appController.createLog(message)).toEqual(message);

      expect(consoleDebug).toEqual('a message');
      expect(consoleWarn).toEqual('');
      expect(consoleError).toEqual('');
    });
    it('a received WARN log should create the correct warn log', () => {
      const message: MessageLog = {
        message: 'a message',
        level: MessageLogLevel.WARN,
        timestamp: new Date(),
        fileName: 'filename.ts?',
        lineNumber: '123',
        additional: null
      };
      expect(appController.createLog(message)).toEqual(message);

      expect(consoleDebug).toEqual('');
      expect(consoleWarn).toEqual('a message');
      expect(consoleError).toEqual('');
    });
    it('a received ERROR log should create the correct error log', () => {
      const message: MessageLog = {
        message: 'a message',
        level: MessageLogLevel.ERROR,
        timestamp: new Date(),
        fileName: 'filename.ts?',
        lineNumber: '123',
        additional: null
      };
      expect(appController.createLog(message)).toEqual(message);

      expect(consoleDebug).toEqual('');
      expect(consoleWarn).toEqual('');
      expect(consoleError).toEqual('a message');
    });
    it('a received FATAL log should create the correct error log', () => {
      const message: MessageLog = {
        message: 'a message',
        level: MessageLogLevel.FATAL,
        timestamp: new Date(),
        fileName: 'filename.ts?',
        lineNumber: '123',
        additional: null
      };
      expect(appController.createLog(message)).toEqual(message);

      expect(consoleDebug).toEqual('');
      expect(consoleWarn).toEqual('');
      expect(consoleError).toEqual('a message');
    });
  });
});
