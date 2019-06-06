export interface RtorrentTorrent {
  name: string;
  hash: string;
  path: string;
  size: number;
  completed: number;
  down_rate: number;
  down_total: number;
  up_rate: number;
  up_total: number;
  createdAt: number;
  complete: boolean;
  addtime: number;
  ratio: number;
  leechers: number;
  seeders: number;
  downloaded: number;
  shouldDownload: boolean;
  active: boolean;
  open: boolean;
  downloadStarted: Date;
  files: RTorrentFile[];
}

export interface RTorrentFile {
  fullpath: string;
  path: string;
  size: number;
  downloaded: number;
  shouldDownload: boolean;
  downloadStarted: Date;
}
