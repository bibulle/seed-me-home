import { NgModule } from '@angular/core';

import {
  // MatButtonModule,
  // MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatCardModule,
  MatMenuModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule
  // MatCardModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class MaterialModule {}
