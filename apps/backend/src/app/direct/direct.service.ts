import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiReturn, DirectDownload, ProgressionType } from '@seed-me-home/models';
import { ProgressionService } from '@seed-me-home/progression';
import { basename } from 'path';

@Injectable()
export class DirectService {
  constructor(private _progressionService: ProgressionService) {}

  getDownloads(): Promise<DirectDownload[]> {
    return new Promise<DirectDownload[]>((resolve, reject) => {
      const progressStrings = this._progressionService.getAll();
      const downloads = progressStrings
        .map((s) => {
          return this._progressionService.getProgressionFromPath(s);
        })
        .filter((p) => {
          return p && p.type === ProgressionType.DIRECT;
        })
        .map((p) => {
          return {
            name: basename(p.url),
            url: p.url,
            shouldDownload: p.shouldDownload,
            downloadStarted: p.downloadStarted,
            downloaded: p.value,
            size: p.size,
          } as DirectDownload;
        });
      resolve(downloads);
    });
  }

  addUrl(url: URL): Promise<ApiReturn> {
    return new Promise<ApiReturn>((resolve) => {
      const progress = this._progressionService.getProgressionFromUrl(url);

      if (progress) {
        throw new BadRequestException('Already exists');
      }

      this._progressionService.setProgression(ProgressionType.DIRECT, url.toString(), 0, undefined, new Date());

      resolve({
        ok: 'added',
      });
    });
  }
}
