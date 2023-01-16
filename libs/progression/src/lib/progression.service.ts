import { Injectable, Logger } from '@nestjs/common';
import { Progression, ProgressionType } from '@seed-me-home/models';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProgressionService {
  readonly logger = new Logger(ProgressionService.name);

  static readonly SIZE_LIMIT_DOWNLOAD = 5 * 1024 * 1024 * 1024;

  private _pathProgress: string;
  private _seedboxFtppath: string;
  private _pathDowload: string;

  init(pathProgress: string, seedboxFtppath: string, pathDowload: string) {
    this._pathProgress = pathProgress;
    this._seedboxFtppath = seedboxFtppath;
    this._pathDowload = pathDowload;

    if (!existsSync(this._pathProgress)) {
      mkdirSync(this._pathProgress);
    }
  }

  getAll(): string[] {
    return readdirSync(this._pathProgress);
  }

  tellProgressionUseful(fullPath: string) {
    fullPath = this.cleanFullFileName(fullPath);

    const fileTrg = this._getProgressionFileName(fullPath);

    if (existsSync(fileTrg)) {
      writeFileSync(fileTrg, ' ', { flag: 'a', encoding: 'utf8' });
    }
  }

  clearOldDoneFiles(olderThan: Date) {
    let files = [];
    try {
      files = readdirSync(this._pathProgress);
      // eslint-disable-next-line no-empty
    } catch (e) {}

    files.forEach((file) => {
      try {
        const modifiedTime = statSync(join(this._pathProgress, file)).mtimeMs;

        if (modifiedTime < olderThan.getTime()) {
          unlinkSync(join(this._pathProgress, file));
        }
      } catch (e) {
        this.logger.error(e.stack);
      }
    });
  }

  removeProgressionFromUrl(url: URL) {
    const fullPath = this.cleanFullFileName(url.toString());

    const fileTrg = this._getProgressionFileName(fullPath);

    unlinkSync(fileTrg);
  }

  getPathLocal() {
    return join(__dirname, '../../..');
  }

  getProgressionFromPath(fullPath: string): Progression {
    fullPath = this.cleanFullFileName(fullPath);

    const fileTrg = this._getProgressionFileName(fullPath);

    try {
      const data = readFileSync(fileTrg, { encoding: 'utf8' });

      const progress = JSON.parse(data) as Progression;
      if (progress.downloadStarted) {
        progress.downloadStarted = new Date(progress.downloadStarted);
      }
      if (!progress.type) {
        progress.type = ProgressionType.TORRENT;
      }

      return progress;
    } catch (e) {
      return null;
    }
  }

  getProgressionFromUrl(url: URL): Progression {
    return this.getProgressionFromPath(url.toString());
  }

  setProgression(type: ProgressionType, fullPathOrUrl: string, value: number, size: number, downloadStarted: Date, name?: string) {
    const previous = this.getProgressionFromPath(fullPathOrUrl);

    const obj: Progression = {
      type: type,
      value: value,
      size: size,
      progress: Math.round((100 * value) / Math.max(1, size)),
      shouldDownload: previous ? previous.shouldDownload : !size || size < ProgressionService.SIZE_LIMIT_DOWNLOAD,
      fullPath: type === ProgressionType.TORRENT ? fullPathOrUrl : undefined,
      url: type === ProgressionType.DIRECT ? fullPathOrUrl : undefined,
      name: name ? name : previous.name,
      downloadStarted: downloadStarted,
    };

    this._saveProgression(fullPathOrUrl, obj);
  }

  switchShouldDownload(type: ProgressionType, fullPath: string, size: number, should: boolean) {
    fullPath = this.cleanFullFileName(fullPath);

    let data = this.getProgressionFromPath(fullPath);
    if (!data) {
      this.setProgression(type, fullPath, 0, size, undefined);
      data = this.getProgressionFromPath(fullPath);
    }

    data.shouldDownload = should;
    this._saveProgression(fullPath, data);
  }

  private _saveProgression(fullPath: string, data: Progression) {
    // this.logger.debug(JSON.stringify(data, null, 2));
    fullPath = this.cleanFullFileName(fullPath);

    const fileTrg = this._getProgressionFileName(fullPath);

    writeFileSync(fileTrg, JSON.stringify(data), {
      flag: 'w',
      encoding: 'utf8',
    });
  }

  private _getProgressionFileName(fullPath: string): string {
    fullPath = this.cleanFullFileName(fullPath);

    // remove the .progress if needed
    fullPath = fullPath.replace(/[.]progress$/, '');

    // eslint-disable-next-line no-useless-escape
    return join(this._pathProgress, fullPath.replace(/[\\/]/g, '_') + '.progress');
  }

  cleanFullFileName(fullPath: string): string {
    const regexp = new RegExp(`.*(${this._seedboxFtppath}|${this._pathDowload})/`, 'g');

    return fullPath.replace(regexp, '');
  }
}
