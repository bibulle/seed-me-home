import { Test, TestingModule } from '@nestjs/testing';
import { FtpSeedService } from './ftp-seed.service';
import { ConfigService } from '../../services/config/config.service';
import * as fs from 'fs';
import * as path from 'path';
import Mock = jest.Mock;

class MockSSH2Client {
  static errorToSendOnConnect = null;
  static errorToSendOnFastGet = null;
  static stopFastGetAfterPercent = 100;
  static isEnded = true;
  fnReady = null;
  fnClose = null;
  fnError = null;
  fnEnd = null;
  on = (key, callback) => {
    switch (key) {
      case 'ready':
        this.fnReady = callback;
        break;
      case 'close':
        this.fnClose = callback;
        break;
      case 'error':
        this.fnError = callback;
        break;
      case 'end':
        this.fnEnd = callback;
        break;
      default:
        console.log('unknown key : ' + key);
    }
  };
  connect = () => {
    if (!MockSSH2Client.errorToSendOnConnect) {
      MockSSH2Client.isEnded = false;
      this.fnReady();
    } else {
      MockSSH2Client.isEnded = true;
      this.fnError(new Error(MockSSH2Client.errorToSendOnConnect));
    }
  };
  sftp = callback => {
    callback(null, this);
  };
  fastGet = (pathSrc, pathTrg, option, callback) => {
    if (!callback) {
      callback = option;
      option = null;
    }
    if (!MockSSH2Client.errorToSendOnFastGet) {
      if (option && option.step) {
        let size = 0;
        const endValue = Math.round((12345678 * MockSSH2Client.stopFastGetAfterPercent) / 100);
        while (size + 32768 < endValue) {
          size += 32768;
          option.step(size, 32768, 12345678);
        }
        option.step(endValue, 32768, 12345678);
      }
      callback(null);
    } else {
      MockSSH2Client.isEnded = true;
      callback(new Error(MockSSH2Client.errorToSendOnFastGet));
    }
  };
  end = () => {
    MockSSH2Client.isEnded = true;
    this.fnEnd();
  };
}

//jest.setTimeout(60000);
describe('FtpSeedService', () => {
  let service: FtpSeedService;
  let configService: ConfigService;
  let ftpServiceLoggerErrorMock: Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FtpSeedService, ConfigService]
    }).compile();

    service = module.get<FtpSeedService>(FtpSeedService);
    ftpServiceLoggerErrorMock = jest.spyOn(FtpSeedService.logger, 'error').mockImplementation(() => {});
    jest.spyOn(FtpSeedService.logger, 'debug').mockImplementation(() => {});

    service.Client = MockSSH2Client;

    configService = module.get<ConfigService>(ConfigService);
    configService.forceConfigFile('env-model.json');
  });

  beforeAll(() => {
    clearProgressAdnDownload();
  });
  afterAll(() => {
    clearProgressAdnDownload();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should download', async () => {
    clearAProgressAndDownload(1);
    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = null;
    service.Client.stopFastGetAfterPercent = 100;

    expect.assertions(2);
    service.setProgression('/torrents/toto/titi_1/tutu\\testFile.txt', 0, 12345678);

    await service.intervalJob();

    expect(service.Client.isEnded).toBeTruthy();
    expect(service.getProgression('toto/titi_1/tutu\\testFile.txt')).toEqual({
      fullPath: 'toto/titi_1/tutu\\testFile.txt',
      progress: 100,
      size: 12345678,
      value: 12345678,
      shouldDownload: true
    });
    clearAProgressAndDownload(1);
  });

  it('should catch error on connection refused', async () => {
    clearAProgressAndDownload(2);
    service.Client.errorToSendOnConnect = 'Connection refused';
    service.Client.errorToSendOnFastGet = null;

    expect.assertions(2);
    ftpServiceLoggerErrorMock.mockClear();

    service.setProgression('/torrents/toto/titi_2/tutu\\testFile.txt', 0, 12345678);
    await service.intervalJob();

    expect(service.Client.isEnded).toBeTruthy();
    expect(ftpServiceLoggerErrorMock).toHaveBeenCalledTimes(1);
    clearAProgressAndDownload(2);
  });

  it('should catch error on file not found', async () => {
    clearAProgressAndDownload(3);
    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = 'No such file';

    expect.assertions(2);
    ftpServiceLoggerErrorMock.mockClear();

    service.setProgression('/torrents/toto/titi_3/tutu\\testFile.txt', 0, 12345678);
    await service.intervalJob();

    expect(service.Client.isEnded).toBeTruthy();
    expect(ftpServiceLoggerErrorMock).toHaveBeenCalledTimes(1);
    clearAProgressAndDownload(3);
  });

  it('should update progression during download', async () => {
    clearAProgressAndDownload(4);
    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = null;
    service.Client.stopFastGetAfterPercent = 43;

    expect.assertions(2);

    service.setProgression('/torrents/toto/titi_4/tutu\\testFile.txt', 0, 12345678);
    await service.intervalJob();

    expect(service.Client.isEnded).toBeTruthy();
    expect(service.getProgression('toto/titi_4/tutu\\testFile.txt')).toEqual({
      fullPath: 'toto/titi_4/tutu\\testFile.txt',
      progress: 43,
      size: 12345678,
      value: 5308642,
      shouldDownload: true
    });
    clearAProgressAndDownload(4);
  });

  it('should work if no progression', () => {
    expect(service.getProgression('notExistingFile.txt')).toBeNull();
  });

  it('should delete old progression', async () => {
    clearAProgressAndDownload(5);
    const before = new Date();

    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = null;
    service.Client.stopFastGetAfterPercent = 100;

    expect.assertions(11);

    service.setProgression('toto/titi_5/tutu\\testFile1.txt', 0, 12345678);
    service.setProgression('toto/titi_5/tutu\\testFile2.txt', 0, 12345678);

    await service.intervalJob();

    expect(service.getProgression('toto/titi_5/tutu\\testFile1.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi_5/tutu\\testFile2.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi_5/tutu\\testFile1.txt').progress).toBe(100);
    expect(service.getProgression('toto/titi_5/tutu\\testFile2.txt').progress).toBe(100);

    service.clearOldDoneFiles(before);
    expect(service.getProgression('toto/titi_5/tutu\\testFile1.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi_5/tutu\\testFile2.txt')).toBeTruthy();

    const after1 = new Date();
    service.tellProgressionUseful('toto/titi_5/tutu\\testFile1.txt');
    service.clearOldDoneFiles(after1);
    expect(service.getProgression('toto/titi_5/tutu\\testFile1.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi_5/tutu\\testFile1.txt').progress).toBe(100);
    expect(service.getProgression('toto/titi_5/tutu\\testFile2.txt')).toBeNull();

    const after2 = new Date(new Date().getTime() + 1000);
    service.clearOldDoneFiles(after2);
    expect(service.getProgression('toto/titi_5/tutu\\testFile1.txt')).toBeNull();
    expect(service.getProgression('toto/titi_5/tutu\\testFile2.txt')).toBeNull();
    clearAProgressAndDownload(5);
  });

  it('should switch value if method called ', () => {
    clearAProgressAndDownload(6);
    service.switchShouldDownload('toto/titi_6/tutu\\testFile1.txt', 10000, true);
    expect(service.getProgression('toto/titi_6/tutu\\testFile1.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi_6/tutu\\testFile1.txt').shouldDownload).toBe(true);
    expect(service.getProgression('toto/titi_6/tutu\\testFile1.txt').progress).toBe(0);

    service.switchShouldDownload('toto/titi_6/tutu\\testFile1.txt', 10000, false);
    expect(service.getProgression('toto/titi_6/tutu\\testFile1.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi_6/tutu\\testFile1.txt').shouldDownload).toBe(false);
    expect(service.getProgression('toto/titi_6/tutu\\testFile1.txt').progress).toBe(0);
    clearAProgressAndDownload(6);
  });
});

const pathDownload = path.join(__dirname, '../../../downloaded_test');
const pathProgress = path.join(__dirname, '../../../progress_test');
function clearProgressAdnDownload() {
  for (let i = 1; i < 7; i++) {
    clearAProgressAndDownload(i);
  }

  if (fs.existsSync(`${pathDownload}/toto`)) {
    fs.rmdirSync(`${pathDownload}/toto`);
  }
  if (fs.existsSync(`${pathDownload}`)) {
    fs.rmdirSync(`${pathDownload}`);
  }
  if (fs.existsSync(`${pathProgress}`)) {
    fs.rmdirSync(`${pathProgress}`);
  }
}
function clearAProgressAndDownload(num: number) {
  if (fs.existsSync(`${pathDownload}/toto/titi_${num}`)) {
    fs.rmdirSync(`${pathDownload}/toto/titi_${num}`);
  }
  if (fs.existsSync(`${pathProgress}`)) {
    fs.readdirSync(`${pathProgress}`)
      .filter(f => {
        return f.startsWith(`toto_titi_${num}`);
      })
      .forEach(f => {
        fs.unlinkSync(`${pathProgress}/` + f);
      });
  }
}
