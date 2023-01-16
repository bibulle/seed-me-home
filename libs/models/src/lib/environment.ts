export class Environment {
  version = '';
  hasTorrent: boolean;
  hasDirectDownload: boolean;

  constructor(hasTorrent = true, hasDirectDownload = true) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const versionJson = require('./version.json');

    this.version = versionJson.version;
    this.hasTorrent = hasTorrent;
    this.hasDirectDownload = hasDirectDownload;
  }
}
