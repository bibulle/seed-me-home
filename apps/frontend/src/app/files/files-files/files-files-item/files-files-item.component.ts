import {
  Component,
  EventEmitter,
  Inject,
  Input,
  NgModule,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FileMove, FilesFile, MoveType } from '@seed-me-home/models';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BytesSizeModule } from '../../../utils/pipes/bytes-size.pipe';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';
import { FilesFilesService } from '../files-files.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'seed-me-home-files-files-item',
  templateUrl: './files-files-item.component.html',
  styleUrls: ['./files-files-item.component.scss'],
})
export class FilesFilesItemComponent implements OnInit {
  @Input()
  file: FilesFile;

  @Input()
  index: number;

  @Input()
  sortItem: string;

  @Input()
  sortDirection: string;

  @Input()
  removeEnable: boolean;

  @Output()
  toggleSortEvent = new EventEmitter<string>();

  @Output()
  removeFileEvent = new EventEmitter<FilesFile>();

  open = false;

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(
    private _translateService: TranslateService,
    private dialog: MatDialog,
    private _filesFilesService: FilesFilesService
  ) {}

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

  getEta(): string {
    if (
      this.file &&
      this.file.downloadStarted &&
      this.file.downloaded !== 0 &&
      this.file.downloaded !== this.file.size
    ) {
      this.file.downloadStarted = new Date(this.file.downloadStarted);

      const dateMilli =
        this.file.downloadStarted.getTime() +
        (this.file.size *
          (new Date().getTime() - this.file.downloadStarted.getTime())) /
          this.file.downloaded;

      moment.locale(this._translateService.currentLang);

      return moment.utc(dateMilli).fromNow();
    } else {
      return '';
    }
  }

  toggleOpen() {
    this.open = !this.open;
  }

  toggleSort(sort: string) {
    this.toggleSortEvent.emit(sort);
  }

  remove() {
    const dialogRef = this.dialog.open(FilesFilesItemDialogRemoveComponent, {
      width: '80%',
      data: this.file.path,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.removeFileEvent.emit(this.file);
      }
    });
  }

  move() {
    const fileMove: FileMove = this._filesFilesService.calculateTrgPath(
      this.file.path,
      this.file.fullpath
    );
    const dialogRef = this.dialog.open(FilesFilesItemDialogMoveComponent, {
      width: '80%',
      data: fileMove,
    });

    dialogRef.afterClosed().subscribe((result: FileMove) => {
      if (result) {
        //console.log(result);
        this._filesFilesService.moveFile(result).then(() => {});
      }
    });
  }
}

@Component({
  selector: 'seed-me-home-files-files-item-dialog-remove',
  templateUrl: './files-files-item-dialog-remove.component.html',
  styleUrls: ['./files-files-item-dialog-remove.component.scss'],
})
export class FilesFilesItemDialogRemoveComponent {
  constructor(
    public dialogRef: MatDialogRef<FilesFilesItemDialogRemoveComponent>,
    @Inject(MAT_DIALOG_DATA) public fileName: string
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'seed-me-home-files-files-item-dialog-move',
  templateUrl: './files-files-item-dialog-move.component.html',
  styleUrls: ['./files-files-item-dialog-move.component.scss'],
})
export class FilesFilesItemDialogMoveComponent {
  moveType = MoveType;

  constructor(
    public dialogRef: MatDialogRef<FilesFilesItemDialogMoveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FileMove
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
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
  ],
  declarations: [
    FilesFilesItemComponent,
    FilesFilesItemDialogRemoveComponent,
    FilesFilesItemDialogMoveComponent,
  ],
  providers: [],
  exports: [FilesFilesItemComponent],
})
export class FilesFilesItemModule {}
