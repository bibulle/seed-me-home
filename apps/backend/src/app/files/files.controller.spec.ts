import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FtpSeedServiceMock } from '../rtorrent/rtorrent.service.spec';
import { FilesService } from './files.service';
import { ConfigService } from '../../services/config/config.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';

describe('Files Controller', () => {
  let controller: FilesController;
  let service: FilesService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService, ConfigService, { provide: FtpSeedService, useClass: FtpSeedServiceMock }]
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
    configService = module.get<ConfigService>(ConfigService);
    configService.forceConfigFile('env-model.json');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('status should be ok', async () => {
    const disk = require('diskusage');
    jest.spyOn(disk, 'check').mockImplementation(() => {
      return new Promise(resolve => {
        resolve({ available: 123456, free: 1234567, total: 12345678 });
      });
    });
    expect(await controller.getStatus()).toEqual({
      free_disk_space_local: 1234567,
      free_disk_space_nas: 1234567,
      total_disk_space_local: 12345678,
      total_disk_space_nas: 12345678
    });
  });

  it('files local should be ok', async () => {
    jest.spyOn(service, 'getFilesLocal').mockImplementation(() => {
      return new Promise(resolve => {
        resolve({
          path: 'dir1',
          fullpath: 'downloaded_test/dir1',
          size: 301000,
          downloaded: 211000,
          isDirectory: true,
          modifiedDate: new Date(0),
          children: [
            {
              path: 'dir1/file1',
              fullpath: 'downloaded_test/dir1/file1',
              size: 100000,
              downloaded: 10000,
              isDirectory: false,
              modifiedDate: new Date(2),
              children: []
            }
          ]
        });
      });
    });
    expect(await controller.getFilesLocal()).toEqual({
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: []
        }
      ]
    });
  });

  it('files nas should be ok', async () => {
    jest.spyOn(service, 'getFilesNas').mockImplementation(() => {
      return new Promise(resolve => {
        resolve({
          path: 'dir1',
          fullpath: 'downloaded_test/dir1',
          size: 301000,
          downloaded: 211000,
          isDirectory: true,
          modifiedDate: new Date(0),
          children: [
            {
              path: 'dir1/file1',
              fullpath: 'downloaded_test/dir1/file1',
              size: 100000,
              downloaded: 10000,
              isDirectory: false,
              modifiedDate: new Date(2),
              children: []
            }
          ]
        });
      });
    });
    expect(await controller.getFilesNas()).toEqual({
      path: 'dir1',
      fullpath: 'downloaded_test/dir1',
      size: 301000,
      downloaded: 211000,
      isDirectory: true,
      modifiedDate: new Date(0),
      children: [
        {
          path: 'dir1/file1',
          fullpath: 'downloaded_test/dir1/file1',
          size: 100000,
          downloaded: 10000,
          isDirectory: false,
          modifiedDate: new Date(2),
          children: []
        }
      ]
    });
  });
});
