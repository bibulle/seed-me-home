import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RtorrentModule } from './rtorrent/rtorrent.module';
import { ConfigService } from '../services/config/config.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RefreshTokenInterceptor } from './interceptors/refresh-token.interceptor';

@Module({
  imports: [RtorrentModule, AuthenticationModule],
  controllers: [AppController, FilesController],
  providers: [
    AppService,
    ConfigService,
    FilesService,
    //FtpSeedService
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor
    }
  ]
})
export class AppModule {}
