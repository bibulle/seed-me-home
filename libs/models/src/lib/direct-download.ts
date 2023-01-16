export interface DirectDownload {
  name: string;
  url: string;
  shouldDownload: boolean;
  downloadStarted: Date;
  downloaded: number;
  size: number;
}
