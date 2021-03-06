import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { environment } from '../../environments/environment';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeAll(async () => {
    environment.production = true;
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService]
    }).compile();
    service = module.get<ConfigService>(ConfigService);
    jest.spyOn(service.logger, 'error').mockImplementation(() => {});
    service.forceConfigFile('env-model.json');
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('Seedbox Mode should be xmlrpc', () => {
    expect(service.getSeedboxMode()).toEqual('xmlrpc');
  });
  it('Seedbox Host should be localhost', () => {
    expect(service.getSeedboxHost()).toEqual('aSeedbox.com');
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
  it('Nas Path should be /mnt/nas/media/Videos/', () => {
    expect(service.getPathNas()).toEqual('/mnt/nas/media/Videos/');
  });
  it('Movies Path should be movies', () => {
    expect(service.getPathMovies()).toEqual('movies');
  });
  it('Series Path should be series', () => {
    expect(service.getPathSeries()).toEqual('series');
  });
  it('Authent Google ID Pass should be my-id', () => {
    expect(service.getAuthentGoogleClientID()).toEqual('my-id');
  });
  it('Authent Google Secret Pass should be my-secret', () => {
    expect(service.getAuthentGoogleClientSecret()).toEqual('my-secret');
  });
  it('Authent Google Callback Pass should be my-callback', () => {
    expect(service.getAuthentGoogleCallbackURL()).toEqual('my-callback');
  });
  it('Authent JWT secret Pass should be authent_jwt_secret', () => {
    expect(service.getAuthentJwtSecret()).toEqual('authent_jwt_secret');
  });
  it('User authorized should be ["authorized user"]', () => {
    expect(service.getUsersAuthorized()).toEqual(['authorized user']);
  });
  it('User admin should be ["administrator"]', () => {
    expect(service.getUsersAdmin()).toEqual(['administrator']);
  });
  it('should exit process on wrong file', () => {
    //@ts-ignore
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    service.forceConfigFile('env-not-existing.json');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
