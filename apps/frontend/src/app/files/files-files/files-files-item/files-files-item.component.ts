import { Component, Inject, Input, NgModule, OnInit, ViewChild } from '@angular/core';
import { FilesFile } from '@seed-me-home/models';
import {
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatIconModule,
  MatMenuModule,
  MatMenuTrigger,
  MatProgressBarModule
} from '@angular/material';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BytesSizeModule } from '../../../utils/pipes/bytes-size.pipe';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-files-files-item',
  templateUrl: './files-files-item.component.html',
  styleUrls: ['./files-files-item.component.scss']
})
export class FilesFilesItemComponent implements OnInit {
  @Input()
  file: FilesFile;

  open = false;

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(private _translateService: TranslateService, public dialog: MatDialog) {}

  ngOnInit() {}

  formatDate(dateMilli: Date | string) {
    if (!dateMilli) {
      return;
    } else if (typeof dateMilli === 'string') {
      dateMilli = new Date(dateMilli);
    }
    moment.locale(this._translateService.currentLang);

    return moment.utc(dateMilli.getTime()).format('lll');
  }

  toggleOpen() {
    this.open = !this.open;
  }

  remove() {
    const dialogRef = this.dialog.open(FilesFilesItemDialogComponent, {
      width: '80%',
      data: this.file.fullpath
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this._filesFilesService.removeTorrent(this.torrent.hash);
      }
    });
  }
}

@Component({
  selector: 'app-files-files-item-dialog',
  templateUrl: './files-files-item-dialog.component.html',
  styleUrls: ['./files-files-item-dialog.component.scss']
})
export class FilesFilesItemDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FilesFilesItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public torrentName: string
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    BytesSizeModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatMenuModule
  ],
  entryComponents: [FilesFilesItemDialogComponent],
  declarations: [FilesFilesItemComponent, FilesFilesItemDialogComponent],
  providers: [],
  exports: [FilesFilesItemComponent]
})
export class FilesFilesItemModule {}
