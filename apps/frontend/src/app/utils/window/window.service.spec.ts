import { WindowService } from './window.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  LoggerTestingModule,
  NGXLogger,
  NGXLoggerHttpService,
  NGXLoggerHttpServiceMock,
  NGXLoggerMock
} from 'ngx-logger';
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('WindowService', () => {
  let service: WindowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerTestingModule],
      controllers: [WindowService],
      providers: [
        { provide: NGXLogger, useClass: NGXLoggerMock },
        { provide: NGXLoggerHttpService, useClass: NGXLoggerHttpServiceMock }
      ]
    }).compile();

    service = module.get<WindowService>(WindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('if no URL, return null', () => {
    expect(WindowService.createWindow(null)).toBeNull();
  });

  it('if all parameters, should be used', async () => {
    jest.spyOn(window, 'open').mockImplementation((url, name, options) => {
      expect(url).toBe('http://www.google.fr');
      expect(name).toBe('A test window');
      expect(options).toContain('width=200');
      expect(options).toContain('height=300');

      return new JSDOM().window;
    });

    expect(WindowService.createWindow('http://www.google.fr', 'A test window', 200, 300)).toBeDefined();
  });
});
