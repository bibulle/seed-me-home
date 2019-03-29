import { Module } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { ConfigService } from '../../services/config/config.service';

@Module({
  controllers: [AuthenticationController],
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthenticationService, GoogleStrategy, JwtStrategy, ConfigService]
})
export class AuthenticationModule {}
