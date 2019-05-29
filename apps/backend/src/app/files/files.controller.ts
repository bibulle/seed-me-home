import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileMove, FilesFile, FilesStatus } from '@seed-me-home/models';
import { FilesService } from './files.service';

class FileFullPath {
  fullpath: string;
}

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getStatus(): Promise<FilesStatus> {
    return this.filesService.getStatus();
  }

  @Get('local')
  @UseGuards(AuthGuard('jwt'))
  async getFilesLocal(): Promise<FilesFile> {
    return this.filesService.getFilesLocal();
  }

  @Get('nas')
  @UseGuards(AuthGuard('jwt'))
  async getFilesNas(): Promise<FilesFile> {
    return this.filesService.getFilesNas();
  }

  @Post('remove')
  @UseGuards(AuthGuard('jwt'))
  async removeFile(@Body() fileFullPath: FileFullPath): Promise<void> {
    return this.filesService.removeFile(fileFullPath.fullpath);
  }

  @Post('move')
  @UseGuards(AuthGuard('jwt'))
  async moveFile(@Body() fileMove: FileMove): Promise<void> {
    return this.filesService.moveFile(fileMove);
  }
}
