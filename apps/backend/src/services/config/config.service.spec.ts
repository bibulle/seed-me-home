import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService]
    }).compile();
    ConfigService.forceConfigFile('env-model.json');
    service = module.get<ConfigService>(ConfigService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('Seedbox Mode should be xmlrpc', () => {
    expect(ConfigService.getSeedboxMode()).toEqual('xmlrpc');
  });
  it('Seedbox Host should be localhost', () => {
    expect(ConfigService.getSeedboxHost()).toEqual('localhost');
  });
  it('Seedbox Port should be 80', () => {
    expect(ConfigService.getSeedboxPort()).toEqual(80);
  });
  it('Seedbox Path should be /rutorrent/plugins/rpc/rpc.php', () => {
    expect(ConfigService.getSeedboxPath()).toEqual('/rutorrent/plugins/rpc/rpc.php');
  });
  it('Seedbox User should be user', () => {
    expect(ConfigService.getSeedboxUser()).toEqual('user');
  });
  it('Seedbox Pass should be password', () => {
    expect(ConfigService.getSeedboxPass()).toEqual('password');
  });
  it('should exit process on wrong file', () => {
    //@ts-ignore
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    //const mockExit = jest.spyOn(process, 'exit').mockImplementation(jest.fn());
    ConfigService.forceConfigFile('env-not-existing.json');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
