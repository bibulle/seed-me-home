export class Progression {
  type: ProgressionType;
  fullPath?: string;
  url?: string;
  value: number;
  size: number;
  progress: number;
  shouldDownload: boolean;
  downloadStarted: Date;
}

export enum ProgressionType {
  TORRENT = 'torrent',
  DIRECT = 'direct',
}
