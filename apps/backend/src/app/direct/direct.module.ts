import { Module } from '@nestjs/common';
import { ProgressionModule } from '@seed-me-home/progression';
import { DirectController } from './direct.controller';
import { DirectService } from './direct.service';

@Module({
  imports: [ProgressionModule],
  controllers: [DirectController],
  providers: [DirectService],
})
export class DirectModule {}
