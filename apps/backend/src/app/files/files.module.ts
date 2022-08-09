import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [FilesService, FtpSeedService],
  exports: [FilesService, FtpSeedService],
})
export class FilesModule {}
