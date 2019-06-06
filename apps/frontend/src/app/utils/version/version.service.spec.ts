import { VersionService } from './version.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Version } from '@seed-me-home/models';

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [VersionService]
    }).compile();

    service = module.get<VersionService>(VersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should do nothing if version is the same', () => {
    const subscriber = jest.fn(b => b);

    service.versionChangedObservable().subscribe(subscriber);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(false);

    service.checkVersion();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(false);
  });

  it('should trigger event (once) if version is not the same', () => {
    const subscriber = jest.fn(b => b);

    service.versionChangedObservable().subscribe(subscriber);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(false);

    VersionService.backendVersion = 'test';
    service.checkVersion();
    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenCalledWith(true);

    service.checkVersion();
    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenCalledWith(true);

    VersionService.backendVersion = new Version().version;
    service.checkVersion();
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber).toHaveBeenCalledWith(false);

    service.checkVersion();
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber).toHaveBeenCalledWith(false);
  });
});
