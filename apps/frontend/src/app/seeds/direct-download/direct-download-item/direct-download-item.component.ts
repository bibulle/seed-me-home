import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { DirectDownload } from '@seed-me-home/models';
import * as moment from 'moment';
import { DirectDownloadService } from '../direct-download.service';

@Component({
  selector: 'seed-me-home-direct-download-item',
  templateUrl: './direct-download-item.component.html',
  styleUrls: ['./direct-download-item.component.scss'],
})
export class DirectDownloadItemComponent implements OnInit {
  @Input()
  download: DirectDownload;

  @Input()
  index: number;

  @Input()
  sortItem: string;

  @Input()
  sortDirection: string;

  @Output()
  toggleSortEvent = new EventEmitter<string>();

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(private _translateService: TranslateService, private _directDownloadService: DirectDownloadService, public dialog: MatDialog) {}

  ngOnInit(): void {
    console.log(this.download);
  }

  formatDate(dateMilli: number) {
    moment.locale(this._translateService.currentLang);

    return moment.utc(dateMilli).format('lll');
  }

  toggleSort(sort: string) {
    this.toggleSortEvent.emit(sort);
  }

  remove() {
    const dialogRef = this.dialog.open(DirectDownloadItemDialogComponent, {
      width: '80%',
      data: this.download.name,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._directDownloadService.removeDownload(this.download.url);
      }
    });
  }
}

@Component({
  selector: 'seed-me-home-direct-download-item-dialog',
  templateUrl: './direct-download-item-dialog.component.html',
  styleUrls: ['./direct-download-item-dialog.component.scss'],
})
export class DirectDownloadItemDialogComponent {
  constructor(public dialogRef: MatDialogRef<DirectDownloadItemDialogComponent>, @Inject(MAT_DIALOG_DATA) public downloadName: string) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
