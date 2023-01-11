/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Logger, Param, Post, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileMove, FilesFile, FilesStatus } from '@seed-me-home/models';
import type { Response } from 'express';
import { FilesService } from './files.service';

class FileFullPath {
  fullpath: string;
}

@Controller('files_api')
export class FilesController {
  // readonly logger = new Logger(FilesController.name);

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

  @Get('download/:filePath(*)')
  // @UseGuards(AuthGuard('jwt'))
  downloadFile(@Param('filePath') filePath: string, @Res({ passthrough: true }) res: Response): StreamableFile {
    return this.filesService.downloadFile(filePath, res);
  }
}
