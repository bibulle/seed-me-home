import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '../../services/config/config.service';
import { GoogleStrategy } from './google.strategy';
import { AuthenticationService, Provider } from './authentication.service';
import { UnauthorizedException } from '@nestjs/common';

describe('GoogleStrategy', () => {
  let service: GoogleStrategy;
  let configService: ConfigService;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    configService = new ConfigService();
    configService.forceConfigFile('env-model.json');

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [{ provide: ConfigService, useValue: configService }, AuthenticationService, GoogleStrategy]
    }).compile();

    service = module.get<GoogleStrategy>(GoogleStrategy);
    authenticationService = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.strategy).toBeDefined();
  });

  it('validate should be ok and call done if profile ok', done => {
    expect.assertions(5);

    jest.spyOn(authenticationService, 'validateOAuthLogin').mockImplementation((profile, provider) => {
      expect(provider).toEqual(Provider.GOOGLE);
      expect(profile).toEqual('profile');
      return new Promise(resolve => {
        resolve('jwt token');
      });
    });

    // refresh token is present, it should warn
    jest.spyOn(service.strategy.logger, 'warn').mockImplementation(msg => {
      expect(msg).toEqual('refresh token found for undefined');
    });

    // Profile is ok and has been return in a jwt token
    const validateDone = jest.fn().mockImplementation((err, user) => {
      expect(err).toBeNull();
      expect(user).toEqual({ jwt: 'jwt token' });
      done();
    });

    //noinspection JSIgnoredPromiseFromCall
    service.strategy.validate(null, null, 'refreshToken', 'profile', validateDone);
  });

  it('validate should be ko and call done if profile ko', done => {
    expect.assertions(6);

    jest.spyOn(authenticationService, 'validateOAuthLogin').mockImplementation((profile, provider) => {
      expect(provider).toEqual(Provider.GOOGLE);
      expect(profile).toEqual('profile');
      return new Promise(() => {
        throw new UnauthorizedException('Not authorized');
      });
    });

    jest.spyOn(service.strategy.logger, 'error').mockImplementation(msg => {
      expect(msg).toEqual('Status : 401 (Not authorized)');
    });

    const validateDone = jest.fn().mockImplementation((err, user) => {
      expect(err).toBeDefined();
      expect(err.toString()).toBe('Error: Not authorized');
      expect(user).toEqual(false);
      done();
    });

    //noinspection JSIgnoredPromiseFromCall
    service.strategy.validate(null, null, 'refreshToken', 'profile', validateDone);
  });
});
