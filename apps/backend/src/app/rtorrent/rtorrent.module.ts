import { Module } from '@nestjs/common';
import { RtorrentController } from './rtorrent.controller';
import { RtorrentService } from './rtorrent.service';
import { ConfigService } from '../../services/config/config.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import { ScheduleModule } from 'nest-schedule';

@Module({
  imports: [ScheduleModule],
  controllers: [RtorrentController],
  providers: [RtorrentService, ConfigService, FtpSeedService],
  exports: [RtorrentService]
})
export class RtorrentModule {}
