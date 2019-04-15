import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService, Provider } from './authentication.service';
import { ConfigService } from '../../services/config/config.service';
import { decode } from 'jsonwebtoken';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ConfigService, AuthenticationService]
    }).compile();
    service = module.get<AuthenticationService>(AuthenticationService);

    configService = module.get<ConfigService>(ConfigService);
    jest.spyOn(configService.logger, 'error').mockImplementation(() => {});
    configService.forceConfigFile('env-model.json');

    jest.spyOn(service.logger, 'debug').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('validateOAuthLogin should return a jwt token', async () => {
    const thirdPartyUser = {
      displayName: 'authorized user',
      _json: {
        family_name: 'family_name',
        given_name: 'given_name',
        locale: 'locale',
        name: 'A test user',
        picture: 'pictureURL',
        sub: '123456'
      }
    };

    service
      .validateOAuthLogin(thirdPartyUser, Provider.GOOGLE)
      .then(value => {
        expect(value).toBeDefined();

        // get a jwToken
        const user = decode(value);

        // should contain a user to
        expect(user).toBeDefined();

        // iat should be now (or near)
        const now = new Date().getTime() / 1000;
        expect(user['iat']).toBeGreaterThanOrEqual(now - 1);
        expect(user['iat']).toBeLessThanOrEqual(now + 1);

        // exp should be now+3600 (or near)
        expect(user['exp']).toBeGreaterThanOrEqual(now + 3600 - 1);
        expect(user['exp']).toBeLessThanOrEqual(now + 3600 + 1);

        // check the whole content
        user['iat'] = 1;
        user['exp'] = 1;
        expect(user).toEqual({
          family_name: 'family_name',
          given_name: 'given_name',
          locale: 'locale',
          name: 'authorized user',
          picture: 'pictureURL',
          provider: 'google',
          providerId: '123456',
          iat: 1,
          exp: 1
        });
      })
      .catch(() => {});
  });

  it('validateOAuthLogin should return an error on wrong thirdPartyUser', async () => {
    const thirdPartyUser = {
      displayName: 'authorized user'
    };

    expect.assertions(2);
    service.validateOAuthLogin(thirdPartyUser, Provider.GOOGLE).catch(err => {
      expect(err).toBeDefined();
      expect(err.response.statusCode).toEqual(500);
    });
  });

  it('validateOAuthLogin should return not authorized on thirdPartyUser not known', async () => {
    const thirdPartyUser = {
      displayName: 'not authorized user'
    };

    expect.assertions(2);
    service.validateOAuthLogin(thirdPartyUser, Provider.GOOGLE).catch(err => {
      expect(err).toBeDefined();
      expect(err.response.statusCode).toEqual(401);
    });
  });
});
