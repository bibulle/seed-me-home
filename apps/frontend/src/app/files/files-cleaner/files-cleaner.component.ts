import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, NgModule, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FilesCleanerService } from './files-cleaner.service';

@Component({
  selector: 'seed-me-home-files-cleaner',
  templateUrl: './files-cleaner.component.html',
  styleUrls: ['./files-cleaner.component.scss'],
})
export class FilesCleanerComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  private _currentCleanersSubscription: Subscription;
  cleanersTxt: string;
  cleanersTxtTextChanged: Subject<string> = new Subject<string>();

  textAreaVisible = false;

  constructor(private _fileCleanerService: FilesCleanerService, private _ngZone: NgZone) {}

  ngOnInit(): void {
    this._currentCleanersSubscription = this._fileCleanerService.cleanersObservable().subscribe((rel) => {
      this.cleanersTxt = rel.join(', ');
    });
  }

  onCleanersChange(newTxt) {
    if (this.cleanersTxtTextChanged.observers.length === 0) {
      this.cleanersTxtTextChanged.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((cleaners) => {
        // console.log(cleaners);
        this._fileCleanerService.setCleaners(cleaners);
      });
    }

    this.cleanersTxtTextChanged.next(newTxt);
  }
}

@NgModule({
  imports: [CommonModule, FormsModule, MatCardModule, TranslateModule, MatIconModule, MatButtonModule, MatInputModule],
  declarations: [FilesCleanerComponent],
  providers: [],
  exports: [FilesCleanerComponent],
})
export class FilesCleanerModule {}
