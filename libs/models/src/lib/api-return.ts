import { FilesFile } from './files-file';
import { FilesStatus } from './files-status';
import { RtorrentStatus } from './rtorrent-status';
import { RtorrentTorrent } from './rtorrent-torrent';
import { Environment } from './environment';

export interface ApiReturn {
  environment: Environment;
  data: RtorrentStatus | FilesStatus | FilesFile | RtorrentTorrent[] | MyToken;
  refreshToken: string;
}

export interface MyToken {
  id_token: string;
}
