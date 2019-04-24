import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../../services/config/config.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthenticationService } from './authentication.service';
import { UnauthorizedException } from '@nestjs/common';

describe('GoogleStrategy', () => {
  let service: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    configService = new ConfigService();
    configService.forceConfigFile('env-model.json');

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [{ provide: ConfigService, useValue: configService }, AuthenticationService, JwtStrategy]
    }).compile();

    service = module.get<JwtStrategy>(JwtStrategy);
    //authenticationService = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.strategy).toBeDefined();
  });

  it('validate should be ok and call done if profile ok', done => {
    expect.assertions(2);

    //noinspection JSIgnoredPromiseFromCall
    service.strategy.validate('a payload', (err, user) => {
      expect(err).toBeNull();
      expect(user).toEqual('a payload');
      done();
    });
  });

  it('validate should be ko and call done if profile ko', async () => {
    expect.assertions(3);

    const validateDone = jest.fn().mockImplementation(() => {
      throw new UnauthorizedException('unauthorized');
    });

    try {
      await service.strategy.validate('a payload', validateDone);
    } catch (err) {
      expect(err.message).toBeDefined();
      expect(err.message.message).toBeDefined();
      //console.log(JSON.stringify(err, null, 2));
      expect(err.message.message).toBe('unauthorized');
    }
  });
});
