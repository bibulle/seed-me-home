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
  files: {
    fullpath: string;
    size: string;
  }[];
}
