import { Controller, Get } from '@nestjs/common';

import { RtorrentService } from './rtorrent.service';
import { RtorrentStatus, RtorrentTorrent } from '@seed-me-home/models';

@Controller('rtorrent')
export class RtorrentController {
  constructor(private readonly rtorrentService: RtorrentService) {}

  @Get('status')
  async getStatus(): Promise<RtorrentStatus> {
    return this.rtorrentService.getStatus();
  }

  @Get('torrents')
  async getTorrents(): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.getTorrents();
  }
}
