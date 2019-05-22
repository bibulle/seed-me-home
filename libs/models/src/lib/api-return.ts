import { FilesStatus, RtorrentStatus, RtorrentTorrent, Version } from '@seed-me-home/models';

export interface ApiReturn {
  version: Version;
  data: RtorrentStatus | FilesStatus | RtorrentTorrent[] | MyToken;
}

export interface MyToken {
  id_token: string;
}
