import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { ConfigService } from '../../services/config/config.service';
import { HttpException } from '@nestjs/common';

describe('AuthenticationController', () => {
  let app: TestingModule;
  let controller: AuthenticationController;
  let configService: ConfigService;

  beforeEach(async () => {
    configService = new ConfigService();
    configService.forceConfigFile('env-model.json');

    app = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [{ provide: ConfigService, useValue: configService }, AuthenticationService]
    }).compile();

    controller = app.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('google login', () => {
    // nothing to test, auth gard will do the job
    controller.googleLogin();
  });

  it('google login callback OK', () => {
    expect.assertions(1);
    expect(controller.googleLoginCallback({ user: { jwt: 'jwt ok' } })).toEqual({ id_token: 'jwt ok' });
  });

  it('google login callback KO', () => {
    expect.assertions(1);
    expect(() => {
      controller.googleLoginCallback({ user: { jwtKO: 'jwt KO' } });
    }).toThrow(HttpException);
  });
});
