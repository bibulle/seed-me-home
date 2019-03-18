export class Version {
  version = '';

  constructor() {
    const versionJson = require('./version.json');

    this.version = versionJson.version;
  }
}
