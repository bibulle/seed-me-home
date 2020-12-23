import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';
import { FilesStatus } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { FilesStatusService } from './files-status.service';

@Component({
  selector: 'seed-me-home-files-status',
  templateUrl: './files-status.component.html',
  styleUrls: ['./files-status.component.scss'],
})
export class FilesStatusComponent implements OnInit, OnDestroy {
  filesStatus: FilesStatus;
  private _currentFilesStatusSubscription: Subscription;

  constructor(private _filesStatusService: FilesStatusService) {}

  ngOnInit() {
    this._currentFilesStatusSubscription = this._filesStatusService
      .currentStatusObservable()
      .subscribe((status: FilesStatus) => {
        this.filesStatus = status;
      });

    this._filesStatusService.startLoadingStats();
  }

  ngOnDestroy() {
    if (this._currentFilesStatusSubscription) {
      this._currentFilesStatusSubscription.unsubscribe();
    }
  }
}
@NgModule({
  imports: [MatCardModule, TranslateModule, MatIconModule, BytesSizeModule],
  declarations: [FilesStatusComponent],
  providers: [],
  exports: [FilesStatusComponent],
})
export class FilesStatusModule {}
