import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiReturn, DirectDownload, RtorrentTorrent } from '@seed-me-home/models';
import { DirectService } from './direct.service';

@Controller('direct')
export class DirectController {
  constructor(private _directService: DirectService) {}

  @Get('direct-downloads')
  @UseGuards(AuthGuard('jwt'))
  async getDownloads(): Promise<DirectDownload[]> {
    return this._directService.getDownloads();
  }

  @Post('add')
  @UseGuards(AuthGuard('jwt'))
  addUrl(@Body('') body): Promise<ApiReturn> {
    if (!body || !body.url) {
      throw new BadRequestException();
    }

    let url: URL;
    try {
      url = new URL(body.url);
    } catch (e) {
      throw new BadRequestException();
    }

    return this._directService.addUrl(url);
  }
}
