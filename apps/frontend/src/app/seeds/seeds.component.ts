import { Component, NgModule, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RtorrentStatusModule } from '../rtorrent-status/rtorrent-status.component';

@Component({
  selector: 'app-seeds',
  templateUrl: './seeds.component.html',
  styleUrls: ['./seeds.component.scss']
})
export class SeedsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

@NgModule({
  imports: [TranslateModule.forChild(), RtorrentStatusModule],
  declarations: [SeedsComponent],
  exports: [SeedsComponent]
})
export class SeedsModule {}