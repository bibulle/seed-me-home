import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
  controllers: [AuthenticationController],
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), ConfigModule],
  providers: [AuthenticationService, GoogleStrategy, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
