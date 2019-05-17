import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NotificationModule } from '../notification/notification.service';
import { JwtHelperServiceService } from './user.service';
import { UserComponent } from './user.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule, MatIconModule, MatMenuModule } from '@angular/material';

@NgModule({
  imports: [
    TranslateModule,
    HttpClientModule,
    NotificationModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  declarations: [UserComponent],
  exports: [UserComponent],
  providers: [JwtHelperServiceService]
})
export class UserModule {}
