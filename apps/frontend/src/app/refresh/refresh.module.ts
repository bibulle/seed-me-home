import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { RefreshComponent } from './refresh.component';
import { RefreshService } from './refresh.service';

@NgModule({
  declarations: [RefreshComponent],
  imports: [CommonModule, MatTooltipModule, MatIconModule, TranslateModule, MatButtonModule, MatProgressBarModule],
  providers: [RefreshService],
  exports: [RefreshComponent],
})
export class RefreshModule {}
