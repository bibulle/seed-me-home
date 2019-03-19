import { Module } from '@nestjs/common';
import { RtorrentController } from './rtorrent.controller';
import { RtorrentService } from './rtorrent.service';
import { ConfigService } from '../../services/config/config.service';

@Module({
  imports: [],
  controllers: [RtorrentController],
  providers: [RtorrentService, ConfigService],
  exports: []
})
export class RtorrentModule {}
