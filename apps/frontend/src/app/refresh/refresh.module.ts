import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefreshComponent } from './refresh.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RefreshService } from './refresh.service';

@NgModule({
  declarations: [RefreshComponent],
  imports: [CommonModule, MatTooltipModule, MatIconModule, TranslateModule, MatButtonModule, MatProgressBarModule],
  providers: [RefreshService],
  exports: [RefreshComponent],
})
export class RefreshModule {}
