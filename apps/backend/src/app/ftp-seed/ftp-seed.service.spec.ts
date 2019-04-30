import { Test, TestingModule } from '@nestjs/testing';
import { FtpSeedService } from './ftp-seed.service';
import { ConfigService } from '../../services/config/config.service';
import * as fs from 'fs';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FtpSeedService, ConfigService]
    }).compile();

    service = module.get<FtpSeedService>(FtpSeedService);
    jest.spyOn(FtpSeedService.logger, 'error').mockImplementation(() => {});
    //jest.spyOn(FtpSeedService.logger, 'debug').mockImplementation(() => {});

    service.Client = MockSSH2Client;

    configService = module.get<ConfigService>(ConfigService);
    configService.forceConfigFile('env-model.json');
  });

  afterEach(() => {
    if (fs.existsSync('downloaded_test/toto/titi')) {
      fs.rmdirSync('downloaded_test/toto/titi');
    }
    if (fs.existsSync('downloaded_test/toto')) {
      fs.rmdirSync('downloaded_test/toto');
    }
    if (fs.existsSync('downloaded_test')) {
      fs.rmdirSync('downloaded_test');
    }
    if (fs.existsSync('progress_test')) {
      fs.readdirSync('progress_test').forEach(f => {
        fs.unlinkSync('progress_test/' + f);
      });
      fs.rmdirSync('progress_test');
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should download', done => {
    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = null;
    service.Client.stopFastGetAfterPercent = 100;

    expect.assertions(3);
    service.downloadFile('/torrents/toto/titi/tutu\\testFile.txt').then(() => {
      expect(true).toBeTruthy();
      expect(service.Client.isEnded).toBeTruthy();
      expect(service.getProgression('toto/titi/tutu\\testFile.txt')).toEqual({
        progress: 100,
        size: 12345678,
        value: 12345678,
        shouldDownload: true
      });
      done();
    });
  });

  it('should catch error on connection refused', done => {
    service.Client.errorToSendOnConnect = 'Connection refused';
    service.Client.errorToSendOnFastGet = null;

    expect.assertions(3);
    service.downloadFile('testFile.txt').catch(err => {
      expect(true).toBeTruthy();
      expect(err.message).toBe('Connection refused');
      expect(service.Client.isEnded).toBeTruthy();
      //console.error(err.message);
      done();
    });
  });

  it('should catch error on file not found', done => {
    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = 'No such file';

    expect.assertions(3);
    service.downloadFile('testFile.txt').catch(err => {
      expect(true).toBeTruthy();
      expect(err.message).toBe('No such file : /torrents/testFile.txt');
      expect(service.Client.isEnded).toBeTruthy();
      done();
    });
  });

  it('should update progression during download', done => {
    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = null;
    service.Client.stopFastGetAfterPercent = 43;

    expect.assertions(2);
    service.downloadFile('toto/titi/tutu\\testFile.txt').then(() => {
      expect(true).toBeTruthy();
      expect(service.getProgression('toto/titi/tutu\\testFile.txt')).toEqual({
        progress: 43,
        size: 12345678,
        value: 5308642,
        shouldDownload: true
      });
      done();
    });
  });

  it('should work if no progression', () => {
    expect(service.getProgression('notExistingFile.txt')).toBeNull();
  });

  it('should delete old progression', done => {
    const before = new Date();

    service.Client.errorToSendOnConnect = null;
    service.Client.errorToSendOnFastGet = null;
    service.Client.stopFastGetAfterPercent = 100;

    expect.assertions(11);
    Promise.all([
      service.downloadFile('toto/titi/tutu\\testFile1.txt'),
      service.downloadFile('toto/titi/tutu\\testFile2.txt')
    ]).then(() => {
      expect(service.getProgression('toto/titi/tutu\\testFile1.txt')).toBeTruthy();
      expect(service.getProgression('toto/titi/tutu\\testFile2.txt')).toBeTruthy();
      expect(service.getProgression('toto/titi/tutu\\testFile1.txt').progress).toBe(100);
      expect(service.getProgression('toto/titi/tutu\\testFile2.txt').progress).toBe(100);

      service.clearOldDoneFiles(before);
      expect(service.getProgression('toto/titi/tutu\\testFile1.txt')).toBeTruthy();
      expect(service.getProgression('toto/titi/tutu\\testFile2.txt')).toBeTruthy();

      const after1 = new Date();
      service.tellProgressionUseful('toto/titi/tutu\\testFile1.txt');
      service.clearOldDoneFiles(after1);
      expect(service.getProgression('toto/titi/tutu\\testFile1.txt')).toBeTruthy();
      expect(service.getProgression('toto/titi/tutu\\testFile1.txt').progress).toBe(100);
      expect(service.getProgression('toto/titi/tutu\\testFile2.txt')).toBeNull();

      const after2 = new Date();
      service.clearOldDoneFiles(after2);
      expect(service.getProgression('toto/titi/tutu\\testFile1.txt')).toBeNull();
      expect(service.getProgression('toto/titi/tutu\\testFile2.txt')).toBeNull();

      done();
    });
  });

  it('should switch value if method called ', () => {
    service.shouldDownload('toto/titi/tutu\\testFile1.txt', 10000, true);
    expect(service.getProgression('toto/titi/tutu\\testFile1.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi/tutu\\testFile1.txt').shouldDownload).toBe(true);
    expect(service.getProgression('toto/titi/tutu\\testFile1.txt').progress).toBe(0);

    service.shouldDownload('toto/titi/tutu\\testFile1.txt', 10000, false);
    expect(service.getProgression('toto/titi/tutu\\testFile1.txt')).toBeTruthy();
    expect(service.getProgression('toto/titi/tutu\\testFile1.txt').shouldDownload).toBe(false);
    expect(service.getProgression('toto/titi/tutu\\testFile1.txt').progress).toBe(0);
  });
});
