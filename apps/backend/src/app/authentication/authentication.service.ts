import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { User } from '@seed-me-home/models';
import { ConfigService } from '../../services/config/config.service';

export enum Provider {
  GOOGLE = 'google'
}

@Injectable()
export class AuthenticationService {
  readonly logger = new Logger(AuthenticationService.name);

  constructor(private readonly _configService: ConfigService) {}

  async validateOAuthLogin(thirdPartyUser: any, provider: Provider): Promise<string> {
    if (this._configService.getUsersAuthorized().indexOf(thirdPartyUser.displayName) < 0) {
      throw new UnauthorizedException(
        'Your are not authorized to use this application (' + thirdPartyUser.displayName + ').'
      );
    }

    try {
      this.logger.debug('validateOAuthLogin "' + thirdPartyUser.displayName + '"');
      // this.logger.debug(thirdPartyUser);
      const user: User = {
        family_name: thirdPartyUser._json.family_name,
        given_name: thirdPartyUser._json.given_name,
        locale: thirdPartyUser._json.locale,
        name: thirdPartyUser._json.name,
        picture: thirdPartyUser._json.picture,
        provider: provider,
        providerId: thirdPartyUser._json.sub,
        isAdmin: this._configService.getUsersAdmin().indexOf(thirdPartyUser.displayName) >= 0
      };

      return sign(user, this._configService.getAuthentJwtSecret(), { expiresIn: 3600 });
    } catch (err) {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }
}
