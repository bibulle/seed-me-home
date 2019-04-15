import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../services/config/config.service';

class RealJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret
    });
  }

  //noinspection JSMethodCanBeStatic
  async validate(payload, done: any) {
    try {
      done(null, payload);
    } catch (err) {
      throw new UnauthorizedException('unauthorized', err.message);
    }
  }
}

@Injectable()
export class JwtStrategy {
  constructor(private readonly _configService: ConfigService) {
    this.strategy = new RealJwtStrategy(this._configService.getAuthentJwtSecret());
  }

  strategy: RealJwtStrategy;
}
