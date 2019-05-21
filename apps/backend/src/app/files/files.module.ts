import { Module } from '@nestjs/common';
import { ConfigService } from '../../services/config/config.service';
import { FtpSeedService } from '../ftp-seed/ftp-seed.service';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [],
  controllers: [FilesController],
  providers: [FilesService, ConfigService, FtpSeedService],
  exports: []
})
export class FilesModule {}
