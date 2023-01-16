import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RtorrentController } from './rtorrent.controller';
import { RtorrentService } from './rtorrent.service';
import { ScheduleModule } from '@nestjs/schedule';
import { FilesModule } from '../files/files.module';
import { ProgressionModule } from '@seed-me-home/progression';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, FilesModule, ProgressionModule],
  controllers: [RtorrentController],
  providers: [RtorrentService],
  exports: [RtorrentService],
})
export class RtorrentModule {}
