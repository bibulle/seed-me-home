import { Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';

import { RtorrentService } from './rtorrent.service';
import { RtorrentStatus, RtorrentTorrent } from '@seed-me-home/models';
import { AuthGuard } from '@nestjs/passport';

@Controller('rtorrent')
export class RtorrentController {
  constructor(private readonly rtorrentService: RtorrentService) {}

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getStatus(): Promise<RtorrentStatus | void> {
    return this.rtorrentService.getStatus();
  }

  @Get('torrents')
  @UseGuards(AuthGuard('jwt'))
  async getTorrents(): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.getTorrents();
  }

  @Put('torrents/:hash/pause')
  @UseGuards(AuthGuard('jwt'))
  async pauseTorrent(@Param('hash') hash: string): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.pauseTorrent(hash);
  }

  @Put('torrents/:hash/start')
  @UseGuards(AuthGuard('jwt'))
  async startTorrent(@Param('hash') hash: string): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.startTorrent(hash);
  }

  @Put('torrents/:hash/shouldDownload/:should')
  @UseGuards(AuthGuard('jwt'))
  async switchShouldDownload(@Param('hash') hash: string, @Param('should') should: string): Promise<RtorrentTorrent[]> {
    let shouldBool = false;
    try {
      shouldBool = JSON.parse(should);
      // eslint-disable-next-line no-empty
    } catch (e) {}

    return this.rtorrentService.switchShouldDownload(hash, shouldBool);
  }

  @Delete('torrents/:hash')
  @UseGuards(AuthGuard('jwt'))
  async removeTorrent(@Param('hash') hash: string): Promise<RtorrentTorrent[]> {
    return this.rtorrentService.removeTorrent(hash);
  }
}
