import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AuthenticationModule } from './authentication/authentication.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { RefreshTokenInterceptor } from './interceptors/refresh-token.interceptor';
import { RtorrentModule } from './rtorrent/rtorrent.module';
import { DirectModule } from './direct/direct.module';

@Module({
  imports: [RtorrentModule, AuthenticationModule, FilesModule, HealthModule, ConfigModule, DirectModule],
  controllers: [AppController],
  providers: [
    //FtpSeedService
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
  ],
})
export class AppModule {}
