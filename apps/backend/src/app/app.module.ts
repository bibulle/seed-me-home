import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RtorrentModule } from './rtorrent/rtorrent.module';

@Module({
  imports: [RtorrentModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
