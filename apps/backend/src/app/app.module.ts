import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '../services/config/config.service';

import { AppController } from './app.controller';
import { AuthenticationModule } from './authentication/authentication.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { RefreshTokenInterceptor } from './interceptors/refresh-token.interceptor';
import { RtorrentModule } from './rtorrent/rtorrent.module';

@Module({
  imports: [RtorrentModule, AuthenticationModule, FilesModule, HealthModule],
  controllers: [AppController],
  providers: [
    ConfigService,
    //FtpSeedService
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
  ],
})
export class AppModule {}
