import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RtorrentModule } from './rtorrent/rtorrent.module';
import { ConfigService } from '../services/config/config.service';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [RtorrentModule, AuthenticationModule],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigService
    //FtpSeedService
  ]
})
export class AppModule {}
