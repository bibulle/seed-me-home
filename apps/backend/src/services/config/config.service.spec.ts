import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService]
    }).compile();
    service = module.get<ConfigService>(ConfigService);
    service.forceConfigFile('env-model.json');
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('Seedbox Mode should be xmlrpc', () => {
    expect(service.getSeedboxMode()).toEqual('xmlrpc');
  });
  it('Seedbox Host should be localhost', () => {
    expect(service.getSeedboxHost()).toEqual('localhost');
  });
  it('Seedbox Port should be 80', () => {
    expect(service.getSeedboxPort()).toEqual(80);
  });
  it('Seedbox Path should be /rutorrent/plugins/rpc/rpc.php', () => {
    expect(service.getSeedboxPath()).toEqual('/rutorrent/plugins/rpc/rpc.php');
  });
  it('Seedbox User should be user', () => {
    expect(service.getSeedboxUser()).toEqual('user');
  });
  it('Seedbox Pass should be password', () => {
    expect(service.getSeedboxPass()).toEqual('password');
  });
  it('should exit process on wrong file', () => {
    //@ts-ignore
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    service.forceConfigFile('env-not-existing.json');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
