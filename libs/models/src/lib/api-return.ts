import { RtorrentStatus, Version } from '@seed-me-home/models';

export interface ApiReturn {
  version: Version;
  data: RtorrentStatus | MyToken;
}

export interface MyToken {
  id_token: string;
}
