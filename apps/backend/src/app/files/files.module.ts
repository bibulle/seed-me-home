import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProgressionModule } from '@seed-me-home/progression';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [ConfigModule, ProgressionModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
