import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { User } from '@seed-me-home/models';
import { ConfigService } from '../../services/config/config.service';

//import * as jwt from '../../jwt.json';

export enum Provider {
  GOOGLE = 'google'
}

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(private readonly _configService: ConfigService) {}

  async validateOAuthLogin(thirdPartyUser: any, provider: Provider): Promise<string> {
    try {
      this.logger.debug('validateOAuthLogin "' + thirdPartyUser.displayName + '"');
      const user: User = {
        family_name: thirdPartyUser._json.family_name,
        given_name: thirdPartyUser._json.given_name,
        locale: thirdPartyUser._json.locale,
        name: thirdPartyUser._json.name,
        picture: thirdPartyUser._json.picture,
        provider: provider,
        providerId: thirdPartyUser._json.sub
      };

      return sign(user, this._configService.getAuthentJwtSecret(), { expiresIn: 3600 });
    } catch (err) {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }
}
