import { FilesFile } from './files-file';
import { FilesStatus } from './files-status';
import { RtorrentStatus } from './rtorrent-status';
import { RtorrentTorrent } from './rtorrent-torrent';
import { Version } from './version';

export interface ApiReturn {
  version: Version;
  data: RtorrentStatus | FilesStatus | FilesFile | RtorrentTorrent[] | MyToken;
  refreshToken: string;
}

export interface MyToken {
  id_token: string;
}
