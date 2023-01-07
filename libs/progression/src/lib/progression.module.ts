import { Module } from '@nestjs/common';
import { ProgressionService } from './progression.service';

@Module({
  controllers: [],
  providers: [ProgressionService],
  exports: [ProgressionService],
})
export class ProgressionModule {}
