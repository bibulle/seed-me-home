import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import { ConfigService } from '../../services/config/config.service';

describe('FilesService', () => {
  let service: FilesService;
  let configService: ConfigService;
  let ftpSeedService: FtpSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService, FtpSeedService, ConfigService]
    }).compile();

    service = module.get<FilesService>(FilesService);

    ftpSeedService = module.get<FtpSeedService>(FtpSeedService);

    configService = module.get<ConfigService>(ConfigService);
    configService.forceConfigFile('env-model.json');
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
});
