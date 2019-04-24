import { RtorrentStatus, RtorrentTorrent, Version } from '@seed-me-home/models';

export interface ApiReturn {
  version: Version;
  data: RtorrentStatus | RtorrentTorrent[] | MyToken;
}

export interface MyToken {
  id_token: string;
}
