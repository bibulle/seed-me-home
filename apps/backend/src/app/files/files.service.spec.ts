import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import { ConfigService } from '../../services/config/config.service';

const fs = require('fs');
jest.mock('fs'); // this auto mocks all methods on fs - so you can treat fs.existsSync and fs.mkdirSync like you would jest.fn()

describe('FilesService', () => {
  let service: FilesService;
  let configService: ConfigService;
  let ftpSeedService: FtpSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService, FtpSeedService, { provide: ConfigService, useClass: ConfigServiceMock }]
    }).compile();

    service = module.get<FilesService>(FilesService);

    ftpSeedService = module.get<FtpSeedService>(FtpSeedService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getStatus should return something', async () => {
    // all ok
    jest.spyOn(ftpSeedService, 'getPathLocal').mockImplementation(() => '.');
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => '.');

    let result = await service.getStatus();

    expect(result).toBeTruthy();
    expect(result.free_disk_space_local).not.toBeNaN();
    expect(result.total_disk_space_local).not.toBeNaN();
    expect(result.total_disk_space_local).toBeGreaterThan(result.free_disk_space_local);
    expect(result.free_disk_space_nas).not.toBeNaN();
    expect(result.total_disk_space_nas).not.toBeNaN();
    expect(result.total_disk_space_nas).toBeGreaterThan(result.free_disk_space_nas);

    // nas KO
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'do_not_exists');

    result = await service.getStatus();

    expect(result).toBeTruthy();
    expect(result.free_disk_space_local).not.toBeNaN();
    expect(result.total_disk_space_local).not.toBeNaN();
    expect(result.total_disk_space_local).toBeGreaterThan(result.free_disk_space_local);
    expect(result.free_disk_space_nas).toBeUndefined();
    expect(result.total_disk_space_nas).toBeUndefined();

    // both KO
    jest.spyOn(ftpSeedService, 'getPathLocal').mockImplementation(() => 'do_not_exists');

    result = await service.getStatus();

    expect(result).toBeTruthy();
    expect(result.free_disk_space_local).toBeUndefined();
    expect(result.total_disk_space_local).toBeUndefined();
    expect(result.free_disk_space_nas).toBeUndefined();
    expect(result.total_disk_space_nas).toBeUndefined();
  });

  it('getFilesLocal should return something', async () => {
    jest.spyOn(fs, 'stat').mockImplementation((path, callback) => {
      switch (path) {
        case 'dir1':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => true,
            mtime: new Date(0)
          });
        case 'dir1/dir2':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => true,
            mtime: new Date(1)
          });
        case 'dir1/file1':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => false,
            mtime: new Date(2)
          });
        case 'dir1/dir2/file2_1':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => false,
            mtime: new Date(3)
          });
        case 'dir1/dir2/file2_2':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => false,
            size: 1000,
            mtime: new Date(4)
          });
        default:
          //console.log(path+' NOT FOUND');
          //@ts-ignore
          return callback(path + ' NOT FOUND');
      }
    });
    jest.spyOn(fs, 'realpathSync').mockImplementation(path => {
      return 'downloaded_test/' + path;
    });
    jest.spyOn(fs, 'readdirSync').mockImplementation(path => {
      switch (path) {
        case 'dir1':
          return ['file1', 'dir2'];
        case 'dir1/dir2':
          return ['file2_1', 'file2_2', 'error_file'];
        default:
          console.log(path + ' NOT FOUND');
      }
    });
    jest.spyOn(ftpSeedService, 'getProgression').mockImplementation(path => {
      switch (path) {
        case 'downloaded_test/dir1/file1':
          return {
            fullPath: path,
            size: 100000,
            value: 10000,
            progress: 10,
            shouldDownload: true
          };
        case 'downloaded_test/dir1/dir2/file2_1':
          return {
            fullPath: path,
            size: 200000,
            value: 200000,
            progress: 100,
            shouldDownload: true
          };
        case 'downloaded_test/dir1/dir2/file2_2':
          return null;
        default:
          console.log(path + ' NOT FOUND');
          return null;
      }
    });
    jest.spyOn(ftpSeedService, 'getPathLocal').mockImplementation(() => 'dir1');

    const result = await service.getFilesLocal();

    expect(result).toBeTruthy();
    expect(result).toEqual({
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: []
        },
        {
          path: 'dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 201000,
          downloaded: 201000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: []
            },
            {
              path: 'file2_2',
              fullpath: 'downloaded_test/dir1/dir2/file2_2',
              size: 1000,
              downloaded: 1000,
              isDirectory: false,
              modifiedDate: new Date(4),
              children: []
            },
            {
              path: 'error_file',
              fullpath: 'error_file',
              size: 0,
              downloaded: 0,
              isDirectory: false,
              modifiedDate: null,
              children: []
            }
          ]
        }
      ]
    });
  });

  it('getFilesNas should return something', async () => {
    jest.spyOn(fs, 'stat').mockImplementation((path, callback) => {
      switch (path) {
        case 'dir1':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => true,
            mtime: new Date(0)
          });
        case 'dir1/dir2':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => true,
            mtime: new Date(1)
          });
        case 'dir1/file1':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => false,
            mtime: new Date(2)
          });
        case 'dir1/dir2/file2_1':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => false,
            mtime: new Date(3)
          });
        case 'dir1/dir2/file2_2':
          //@ts-ignore
          return callback(null, {
            isDirectory: () => false,
            size: 1000,
            mtime: new Date(4)
          });
        default:
          //console.log(path+' NOT FOUND');
          //@ts-ignore
          return callback(path + ' NOT FOUND');
      }
    });
    jest.spyOn(fs, 'realpathSync').mockImplementation(path => {
      return 'downloaded_test/' + path;
    });
    jest.spyOn(fs, 'readdirSync').mockImplementation(path => {
      switch (path) {
        case 'dir1':
          return ['file1', 'dir2'];
        case 'dir1/dir2':
          return ['file2_1', 'file2_2', 'error_file'];
        default:
          console.log(path + ' NOT FOUND');
      }
    });
    jest.spyOn(ftpSeedService, 'getProgression').mockImplementation(path => {
      switch (path) {
        case 'downloaded_test/dir1/file1':
          return {
            fullPath: path,
            size: 100000,
            value: 10000,
            progress: 10,
            shouldDownload: true
          };
        case 'downloaded_test/dir1/dir2/file2_1':
          return {
            fullPath: path,
            size: 200000,
            value: 200000,
            progress: 100,
            shouldDownload: true
          };
        case 'downloaded_test/dir1/dir2/file2_2':
          return null;
        default:
          console.log(path + ' NOT FOUND');
          return null;
      }
    });
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'dir1');

    const result = await service.getFilesNas();

    expect(result).toBeTruthy();
    expect(result).toEqual({
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: []
        },
        {
          path: 'dir2',
          fullpath: 'downloaded_test/dir1/dir2',
          size: 201000,
          downloaded: 201000,
          isDirectory: true,
          modifiedDate: new Date(1),
          children: [
            {
              path: 'file2_1',
              fullpath: 'downloaded_test/dir1/dir2/file2_1',
              size: 200000,
              downloaded: 200000,
              isDirectory: false,
              modifiedDate: new Date(3),
              children: []
            },
            {
              path: 'file2_2',
              fullpath: 'downloaded_test/dir1/dir2/file2_2',
              size: 1000,
              downloaded: 1000,
              isDirectory: false,
              modifiedDate: new Date(4),
              children: []
            },
            {
              path: 'error_file',
              fullpath: 'error_file',
              size: 0,
              downloaded: 0,
              isDirectory: false,
              modifiedDate: null,
              children: []
            }
          ]
        }
      ]
    });
  });
});
class ConfigServiceMock {
  getPathNas() {
    return '.';
  }
  getPathDownload() {
    return '.';
  }
}
