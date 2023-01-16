import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';
import { DirectDownloadComponent } from './direct-download.component';
import { DirectDownloadItemComponent, DirectDownloadItemDialogComponent } from './direct-download-item/direct-download-item.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [DirectDownloadComponent, DirectDownloadItemComponent, DirectDownloadItemDialogComponent],
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, TranslateModule, MatIconModule, BytesSizeModule, MatInputModule, MatProgressBarModule, MatDialogModule, MatMenuModule],
  exports: [DirectDownloadComponent],
})
export class DirectDownloadModule {}
