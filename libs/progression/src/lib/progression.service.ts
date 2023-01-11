import { Injectable, Logger } from '@nestjs/common';
import { Progression } from '@seed-me-home/models';
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

  getPathLocal() {
    return join(__dirname, '../../..');
  }

  getProgression(fullPath: string): Progression {
    fullPath = this.cleanFullFileName(fullPath);

    const fileTrg = this._getProgressionFileName(fullPath);

    try {
      const data = readFileSync(fileTrg, { encoding: 'utf8' });

      const progress = JSON.parse(data) as Progression;
      if (progress.downloadStarted) {
        progress.downloadStarted = new Date(progress.downloadStarted);
      }

      return progress;
    } catch (e) {
      return null;
    }
  }

  setProgression(fullPath: string, value: number, size: number, downloadStarted: Date) {
    const previous = this.getProgression(fullPath);

    const obj: Progression = {
      value: value,
      size: size,
      progress: Math.round((100 * value) / Math.max(1, size)),
      shouldDownload: previous ? previous.shouldDownload : size < ProgressionService.SIZE_LIMIT_DOWNLOAD,
      fullPath: fullPath,
      downloadStarted: downloadStarted,
    };

    this._saveProgression(fullPath, obj);
  }

  switchShouldDownload(fullPath: string, size: number, should: boolean) {
    fullPath = this.cleanFullFileName(fullPath);

    let data = this.getProgression(fullPath);
    if (!data) {
      this.setProgression(fullPath, 0, size, undefined);
      data = this.getProgression(fullPath);
    }

    data.shouldDownload = should;
    this._saveProgression(fullPath, data);
  }

  private _saveProgression(fullPath: string, data: Progression) {
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
