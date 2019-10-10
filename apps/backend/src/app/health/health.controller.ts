import { Controller, Get } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { RtorrentService } from '../rtorrent/rtorrent.service';

@Controller('health')
export class HealthController {
  constructor(private readonly filesService: FilesService, private readonly rtorrentService: RtorrentService) {}

  @Get('')
  async getHealth(): Promise<any> {
    return Promise.all([this.filesService.getStatus(), this.rtorrentService.getStatus()]);
  }
}
