import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

class RealJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: any, done: any): Promise<void> {
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
    this.strategy = new RealJwtStrategy(
      this._configService.get('AUTHENT_JWT_SECRET')
    );
  }

  strategy: RealJwtStrategy;
}
