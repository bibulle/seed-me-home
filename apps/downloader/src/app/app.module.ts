import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ProgressionModule } from '@seed-me-home/progression';
import { FtpSeedService } from './ftp-seed/ftp-seed.service';
import { DirectDownloadService } from './direct-download/direct-download.service';

@Module({
  imports: [ConfigModule, ProgressionModule, ScheduleModule.forRoot()],
  providers: [FtpSeedService, DirectDownloadService],
})
export class AppModule {}
