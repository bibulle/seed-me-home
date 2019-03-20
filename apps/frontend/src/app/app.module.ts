import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RtorrentStatusComponent } from './rtorrent-status/rtorrent-status.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [AppComponent, RtorrentStatusComponent],
  imports: [BrowserModule, HttpClientModule, MaterialModule],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}
