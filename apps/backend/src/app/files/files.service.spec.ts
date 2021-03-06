import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import { ConfigService } from '../../services/config/config.service';
import { MoveType } from '@seed-me-home/models';

const fs = require('fs');
jest.mock('fs'); // this auto mocks all methods on fs - so you can treat fs.existsSync and fs.mkdirSync like you would jest.fn()

jest.mock('mv');
const mv = require('mv');

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
          return ['file1', 'dir2', '.ignore'];
        case 'dir1/dir2':
          return ['file2_1', 'file2_2'];
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
            }
          ]
        }
      ]
    });
  });

  it('getFilesLocal should return error if file is wrong', async () => {
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

    const result = await service.getFilesLocal().catch(reason => {
      expect(reason).toBeTruthy();
    });

    expect(result).toBeFalsy();
  });

  it('getFilesLocal should return error if too many levels', async () => {
    jest.spyOn(fs, 'stat').mockImplementation((path: string, callback) => {
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
          if (path.endsWith('/dir3')) {
            //@ts-ignore
            return callback(null, {
              isDirectory: () => true,
              mtime: new Date(1)
            });
          } else {
            //console.log(path+' NOT FOUND');
            //@ts-ignore
            return callback(path + ' NOT FOUND');
          }
      }
    });
    jest.spyOn(fs, 'realpathSync').mockImplementation(path => {
      return 'downloaded_test/' + path;
    });
    jest.spyOn(fs, 'readdirSync').mockImplementation((path: string) => {
      switch (path) {
        case 'dir1':
          return ['file1', 'dir2', '.ignore'];
        case 'dir1/dir2':
          return ['file2_1', 'file2_2', 'dir3'];
        default:
          if (path.endsWith('/dir3')) {
            return ['dir3'];
          } else {
            console.log(path + ' NOT FOUND');
          }
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

    const result = await service.getFilesLocal().catch(reason => {
      expect(reason).toBeTruthy();
      expect(reason).toBe('Too many levels');
    });

    expect(result).toBeFalsy();
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
          return ['file2_1', 'file2_2'];
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
            }
          ]
        }
      ]
    });
  });

  it('getFilesNas should return error if file is wrong', async () => {
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

    const result = await service.getFilesNas().catch(reason => {
      expect(reason).toBeTruthy();
    });

    expect(result).toBeFalsy();
  });

  it('should removeFile answer something', async () => {
    expect.assertions(8);

    // File not found => error
    jest.spyOn(fs, 'realpathSync').mockImplementation(() => {
      throw new Error('Error');
    });
    service
      .removeFile('not_found')
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        expect(err).toBeTruthy();
      });

    // File not in Local nor Nas => error
    jest.spyOn(configService, 'getPathDownload').mockImplementation(() => 'download_test');
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'nas_test');
    jest.spyOn(fs, 'realpathSync').mockImplementation((path: string) => {
      if (path.endsWith('download_test')) {
        return '/test/toto/titi/download_test';
      } else if (path.endsWith('nas_test')) {
        return '/test/toto/titi/nas_test';
      } else {
        return '/test/toto/titi/toto.txt';
      }
    });
    service
      .removeFile('toto.txt')
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        expect(err).toBeTruthy();
      });

    // Directory in Local and can remove => OK
    jest.spyOn(configService, 'getPathDownload').mockImplementation(() => 'download_test');
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'nas_test');
    jest.spyOn(fs, 'existsSync').mockImplementation(() => {
      return true;
    });
    jest.spyOn(fs, 'lstatSync').mockImplementation((path: string) => {
      if (path.endsWith('directory1')) {
        return {
          isDirectory() {
            return true;
          }
        };
      } else {
        return {
          isDirectory() {
            return false;
          }
        };
      }
    });
    jest.spyOn(fs, 'unlinkSync').mockImplementation(path => {
      console.log('unlink ' + path);
      expect(path).toBe('/test/toto/titi/download_test/directory1/toto.txt');
    });
    jest.spyOn(fs, 'rmdirSync').mockImplementation(path => {
      console.log('rmdir ' + path);
      expect(path).toBe('/test/toto/titi/download_test/directory1');
    });
    jest.spyOn(fs, 'realpathSync').mockImplementation((path: string) => {
      if (path.endsWith('download_test')) {
        return '/test/toto/titi/download_test';
      } else if (path.endsWith('nas_test')) {
        return '/test/toto/titi/nas_test';
      } else if (path.endsWith('directory1')) {
        return '/test/toto/titi/download_test/directory1';
      } else {
        return '/test/toto/titi/download_test/directory1/toto.txt';
      }
    });
    jest.spyOn(fs, 'readdirSync').mockImplementation((path: string) => {
      if (path.endsWith('directory1')) {
        return ['toto.txt'];
      } else {
        return [];
      }
    });
    service
      .removeFile('directory1')
      .then(() => {
        expect(true).toBe(true);
      })
      .catch(err => {
        console.log('catch' + err);
        expect(err).toBeFalsy();
      });

    // File in Nas and can remove => OK
    jest.spyOn(configService, 'getPathDownload').mockImplementation(() => 'download_test');
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'nas_test');
    jest.spyOn(fs, 'unlinkSync').mockImplementation(path => {
      console.log('unlink ' + path);
      expect(path).toBe('/test/toto/titi/nas_test/toto.txt');
    });
    jest.spyOn(fs, 'realpathSync').mockImplementation((path: string) => {
      if (path.endsWith('download_test')) {
        return '/test/toto/titi/download_test';
      } else if (path.endsWith('nas_test')) {
        return '/test/toto/titi/nas_test';
      } else {
        return '/test/toto/titi/nas_test/toto.txt';
      }
    });
    service
      .removeFile('toto.txt')
      .then(() => {
        expect(true).toBe(true);
      })
      .catch(err => {
        console.log('catch' + err);
        expect(err).toBeFalsy();
      });

    // File in Nas and cannot remove (with exception)
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
      throw new Error('error');
    });
    service
      .removeFile('toto.txt')
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        expect(err).toBeTruthy();
      });
  });

  it('should moveFile answer something', async () => {
    expect.assertions(13);

    // No parameter
    await service
      .moveFile(undefined)
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        //console.log(err);
        expect(err).toBeTruthy();
        expect(err.message).toBe('Bad request');
      });

    // Nas not exist
    jest.spyOn(fs, 'realpathSync').mockImplementation(() => {
      throw new Error('Error');
    });

    await service
      .moveFile({
        sourceFullPath: 'not_found',
        sourcePath: 'not_found',
        targetPath: 'not_found',
        targetType: MoveType.movies
      })
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        //console.log(err.message);
        expect(err).toBeTruthy();
        expect(err.message).toBe('Nas not found');
      });

    // Source file not found
    jest.spyOn(fs, 'realpathSync').mockImplementation(p => {
      if (p === '.') {
        return '/test/toto/titi/nas_test';
      } else {
        throw new Error('Error');
      }
    });
    await service
      .moveFile({
        sourceFullPath: 'not_found',
        sourcePath: 'not_found',
        targetPath: 'not_found',
        targetType: MoveType.movies
      })
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        //console.log(err.message);
        expect(err).toBeTruthy();
        expect(err.message).toEqual('File not found');
      });

    // File not in Local nor Nas
    jest.spyOn(configService, 'getPathDownload').mockImplementation(() => 'download_test');
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'nas_test');
    jest.spyOn(fs, 'realpathSync').mockImplementation((path: string) => {
      if (path.endsWith('download_test')) {
        return '/test/toto/titi/download_test';
      } else if (path.endsWith('nas_test')) {
        return '/test/toto/titi/nas_test';
      } else {
        return '/test/toto/titi/toto.txt';
      }
    });
    await service
      .moveFile({
        sourceFullPath: '/test/toto/titi/toto.txt',
        sourcePath: 'not_found',
        targetPath: 'not_found',
        targetType: MoveType.movies
      })
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        //console.log(err.message);
        expect(err).toBeTruthy();
        expect(err.message).toBe('Forbidden');
      });

    // File ok and cannot create dir
    jest.spyOn(configService, 'getPathDownload').mockImplementation(() => 'download_test');
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'nas_test');
    jest.spyOn(configService, 'getPathMovies').mockImplementation(() => 'movies_test');
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
      return ['titi'];
    });
    jest.spyOn(fs, 'realpathSync').mockImplementation((path: string) => {
      if (path.endsWith('download_test')) {
        return '/test/toto/titi/download_test';
      } else if (path.endsWith('nas_test')) {
        return '/test/toto/titi/nas_test';
      } else {
        return '/test/toto/titi/download_test/toto.txt';
      }
    });
    mv.mockImplementation((src, trg, option, callback) => {
      return callback('Error mkdir');
    });

    await service
      .moveFile({
        sourceFullPath: '/test/toto/titi/download_test/toto.txt',
        sourcePath: 'toto.txt',
        targetPath: 'TiTi/toto.txt',
        targetType: MoveType.movies
      })
      .then(() => {
        expect(true).toBe(false);
      })
      .catch(err => {
        expect(err).toBeTruthy();
        expect(err.message).toEqual('Error mkdir');
      });

    // Everything ok, paths should be correct
    jest.spyOn(configService, 'getPathDownload').mockImplementation(() => 'download_test');
    jest.spyOn(configService, 'getPathNas').mockImplementation(() => 'nas_test');
    jest.spyOn(configService, 'getPathSeries').mockImplementation(() => 'series_test');
    jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
      return ['titi'];
    });
    jest.spyOn(fs, 'existsSync').mockImplementation((path: string) => {
      switch (path) {
        case 'nas_test':
        case 'nas_test/series_test':
          return true;
        default:
          //console.log('existsSync '+path);
          return false;
      }
    });
    jest.spyOn(fs, 'realpathSync').mockImplementation((path: string) => {
      if (path.endsWith('download_test')) {
        return '/test/toto/titi/download_test';
      } else if (path.endsWith('nas_test')) {
        return '/test/toto/titi/nas_test';
      } else {
        return '/test/toto/titi/download_test/toto.txt';
      }
    });
    mv.mockImplementation((src, trg, option, callback) => {
      expect(src).toEqual('/test/toto/titi/download_test/toto.txt');
      expect(trg).toEqual('nas_test/series_test/titi/toto.txt');
      return callback();
    });

    await service
      .moveFile({
        sourceFullPath: '/test/toto/titi/download_test/toto.txt',
        sourcePath: 'toto.txt',
        targetPath: 'TiTi/toto.txt',
        targetType: MoveType.series
      })
      .then(() => {
        expect(true).toBe(true);
      })
      .catch(err => {
        console.log(err);
        expect(true).toBe(false);
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

  getPathMovies() {
    return 'movies';
  }

  getPathSeries() {
    return 'series';
  }
}
