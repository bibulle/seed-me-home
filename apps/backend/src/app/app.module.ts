import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RtorrentModule } from './rtorrent/rtorrent.module';
import { ConfigService } from '../services/config/config.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RefreshTokenInterceptor } from './interceptors/refresh-token.interceptor';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [RtorrentModule, AuthenticationModule, FilesModule, HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigService,
    //FtpSeedService
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor
    }
  ]
})
export class AppModule {}
