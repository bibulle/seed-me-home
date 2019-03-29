import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthenticationService, Provider } from './authentication.service';
import { ConfigService } from '../../services/config/config.service';

class RealGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(RealGoogleStrategy.name);

  constructor(private readonly authenticationService: AuthenticationService, _clientID, clientSecret, callbackURL) {
    super({
      clientID: _clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true,
      scope: ['profile']
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile, done: any) {
    try {
      // this.logger.debug(JSON.stringify(profile), 'validate');
      const jwt: string = await this.authenticationService.validateOAuthLogin(profile, Provider.GOOGLE);
      const user = {
        jwt
      };
      done(null, user);
    } catch (err) {
      this.logger.error('validate');
      this.logger.error(err);
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
      this._configService.getAuthentGoogleClientID(),
      this._configService.getAuthentGoogleClientSecret(),
      this._configService.getAuthentGoogleCallbackURL()
    );
  }

  private strategy: RealGoogleStrategy;
}
