import { FilesFile } from './files-file';
import { FilesStatus } from './files-status';
import { RtorrentStatus } from './rtorrent-status';
import { RtorrentTorrent } from './rtorrent-torrent';
import { Environment } from './environment';
import { DirectDownload } from './direct-download';

export interface ApiReturn {
  ok?: string;
  environment?: Environment;
  data?: RtorrentStatus | FilesStatus | FilesFile | RtorrentTorrent[] | DirectDownload[] | MyToken;
  refreshToken?: string;
}

export interface MyToken {
  id_token: string;
}
