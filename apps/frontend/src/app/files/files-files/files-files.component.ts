import { Component, Input, NgModule, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule, MatIconModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';
import { FilesFile } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { FilesFilesService } from './files-files.service';
import { CommonModule } from '@angular/common';
import { FilesFilesItemModule } from './files-files-item/files-files-item.component';

@Component({
  selector: 'app-files-files',
  templateUrl: './files-files.component.html',
  styleUrls: ['./files-files.component.scss']
})
export class FilesFilesComponent implements OnInit, OnDestroy {
  @Input()
  filePath: FilePath;

  public filePathTypes = FilePath;

  filesFiles: FilesFile;
  private _currentFilesFilesSubscription: Subscription;

  sortItem = 'date';
  sortDirection = 'desc';

  constructor(private _filesFilesService: FilesFilesService) {}

  ngOnInit() {
    let observable;
    switch (this.filePath) {
      case FilePath.Local:
        observable = this._filesFilesService.currentFilesObservableLocal();
        this.sortItem = 'date';
        break;
      case FilePath.Nas:
        observable = this._filesFilesService.currentFilesObservableNas();
        this.sortItem = 'name';
        break;
    }
    if (observable) {
      this._currentFilesFilesSubscription = observable.subscribe((files: FilesFile) => {
        if (!this.filesFiles) {
          this.filesFiles = files;
          this._doSort();
        } else {
          this._doSort(files);
          this.mergeFiles(this.filesFiles, files);
        }
      });
    }

    this._filesFilesService.startLoadingStats();
  }

  ngOnDestroy() {
    if (this._currentFilesFilesSubscription) {
      this._currentFilesFilesSubscription.unsubscribe();
    }
  }

  mergeFiles(trg: FilesFile, src: FilesFile) {
    trg.path = src.path;
    trg.fullpath = src.fullpath;
    trg.size = src.size;
    trg.downloaded = src.downloaded;
    trg.isDirectory = src.isDirectory;
    trg.modifiedDate = src.modifiedDate;

    const toBeDeleted: number[] = [];
    const maxIndex = Math.max(trg.children.length, src.children.length);
    for (let i = 0; i < maxIndex; i++) {
      if (i < src.children.length && i < trg.children.length) {
        this.mergeFiles(trg.children[i], src.children[i]);
      } else if (i >= trg.children.length) {
        trg.children.push(src.children[i]);
      } else {
        toBeDeleted.push(i);
      }
    }

    toBeDeleted.reverse().forEach(i => {
      trg.children.splice(i, 1);
    });
  }

  removeFile(file: FilesFile) {
    this._filesFilesService
      .removeFile(file.fullpath)
      .then(() => {
        this._removeFromFile(this.filesFiles, file.fullpath);
      })
      .catch(() => {});
  }

  _removeFromFile(file: FilesFile, fullpath: string): boolean {
    let found = false;
    if (!file) {
      return false;
    } else {
      file.children = file.children.filter(f => {
        found = f.fullpath === fullpath;
        return f.fullpath !== fullpath;
      });
      file.children.forEach(f => {
        if (!found) {
          found = this._removeFromFile(f, fullpath);
        }
      });
      return found;
    }
  }

  toggleSort(sort: string) {
    if (sort === this.sortItem) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortItem = sort;
      this.sortDirection = 'desc';
    }
    this._doSort();
  }

  _doSort(files = this.filesFiles) {
    if (files) {
      files.children.sort((f1: FilesFile, f2: FilesFile) => {
        let ret = 0;
        switch (this.sortItem) {
          case 'name':
            ret = f1.path.localeCompare(f2.path);
            break;
          case 'date':
            ret = new Date(f1.modifiedDate).getTime() - new Date(f2.modifiedDate).getTime();
            break;
          case 'size':
            ret = f1.size - f2.size;
            break;
          case 'progress':
            ret = f1.downloaded / Math.max(1, f1.size) - f2.downloaded / Math.max(1, f2.size);
            break;
        }

        if (ret === 0) {
          ret = new Date(f1.modifiedDate).getTime() - new Date(f2.modifiedDate).getTime();
        }
        return ret;
      });
      if (this.sortDirection === 'desc') {
        files.children.reverse();
      }
      files.children.forEach(f => {
        this._doSort(f);
      });
    }
  }
}

export enum FilePath {
  Local,
  Nas
}

@NgModule({
  imports: [CommonModule, MatCardModule, TranslateModule, MatIconModule, BytesSizeModule, FilesFilesItemModule],
  declarations: [FilesFilesComponent],
  providers: [],
  exports: [FilesFilesComponent]
})
export class FilesFilesModule {}
