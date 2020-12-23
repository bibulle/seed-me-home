import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { FilesModule } from '../files/files.module';
import { RtorrentModule } from '../rtorrent/rtorrent.module';

@Module({
  imports: [FilesModule, RtorrentModule],
  controllers: [HealthController],
})
export class HealthModule {}
