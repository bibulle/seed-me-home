import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesStatus } from '@seed-me-home/models';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getStatus(): Promise<FilesStatus> {
    return this.filesService.getStatus();
  }
}
