import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { AuthenticationService, Provider } from './authentication.service';

class RealGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  readonly logger = new Logger(RealGoogleStrategy.name);

  constructor(
    private readonly authenticationService: AuthenticationService,
    _clientID,
    clientSecret,
    callbackURL
  ) {
    //noinspection JSUnusedGlobalSymbols
    super({
      clientID: _clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true,
      scope: ['profile'],
      accessType: 'offline',
      approval_prompt: 'force',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    done: any
  ) {
    try {
      // this.logger.debug(accessToken);
      if (refreshToken) {
        this.logger.warn(`refresh token found for ${profile.displayName}`);
      }
      const jwt: string = await this.authenticationService.validateOAuthLogin(
        profile,
        Provider.GOOGLE
      );
      const user = {
        jwt,
      };
      done(null, user);
    } catch (err) {
      this.logger.error(
        'Status : ' + err.status + ' (' + err.message.message + ')'
      );
      done(err, false);
    }
  }
}

@Injectable()
export class GoogleStrategy {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly _configService: ConfigService
  ) {
    this.strategy = new RealGoogleStrategy(
      this.authenticationService,
      this._configService.get('AUTHENT_GOOGLE_CLIENTID'),
      this._configService.get('AUTHENT_GOOGLE_CLIENTSECRET'),
      this._configService.get('AUTHENT_GOOGLE_CALLBACKURL')
    );
  }

  strategy: RealGoogleStrategy;
}
