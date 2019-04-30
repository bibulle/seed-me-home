import { Controller, Delete, Get, Param, Put } from '@nestjs/common';

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

  @Put('torrents/:hash/pause')
  async pauseTorrent(@Param('hash') hash: string): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.pauseTorrent(hash);
  }

  @Put('torrents/:hash/start')
  async startTorrent(@Param('hash') hash: string): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.startTorrent(hash);
  }

  @Put('torrents/:hash/shouldDownload/:should')
  async shouldDownload(@Param('hash') hash: string, @Param('should') should: string): Promise<RtorrentTorrent[]> {
    let shouldBool = false;
    try {
      shouldBool = JSON.parse(should);
    } catch (e) {}

    return this.rtorrentService.shouldDownload(hash, shouldBool);
  }

  @Delete('torrents/:hash')
  async removeTorrent(@Param('hash') hash: string): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.removeTorrent(hash);
  }
}
