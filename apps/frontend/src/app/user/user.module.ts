import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NotificationModule } from '../notification/notification.service';
import { JwtHelperServiceService } from './user.service';
import { UserComponent } from './user.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [TranslateModule, HttpClientModule, NotificationModule, CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  declarations: [UserComponent],
  exports: [UserComponent],
  providers: [JwtHelperServiceService],
})
export class UserModule {}
