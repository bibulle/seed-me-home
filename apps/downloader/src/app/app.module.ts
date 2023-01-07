/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ProgressionModule } from '@seed-me-home/progression';
import { FtpSeedService } from './ftp-seed/ftp-seed.service';

@Module({
  imports: [ConfigModule, ProgressionModule, ScheduleModule.forRoot()],
  providers: [FtpSeedService],
})
export class AppModule {}
