import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RtorrentController } from './rtorrent.controller';
import { RtorrentService } from './rtorrent.service';
import { ScheduleModule } from '@nestjs/schedule';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, FilesModule],
  controllers: [RtorrentController],
  providers: [RtorrentService],
  exports: [RtorrentService],
})
export class RtorrentModule {}
