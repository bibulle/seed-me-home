import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Environment } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { EnvironmentService } from '../utils/env/environment.service';
import { DirectDownloadModule } from './direct-download/direct-download.module';
import { RtorrentStatusModule } from './rtorrent-status/rtorrent-status.component';
import { RtorrentTorrentsModule } from './rtorrent-torrents/rtorrent-torrents.component';

@Component({
  selector: 'seed-me-home-seeds',
  templateUrl: './seeds.component.html',
  styleUrls: ['./seeds.component.scss'],
})
export class SeedsComponent implements OnInit {
  environment = new Environment();

  private _currentEnvironmentChangedSubscription: Subscription;

  constructor(private _envService: EnvironmentService) {}

  ngOnInit() {
    this._currentEnvironmentChangedSubscription = this._envService.environmentChangedObservable().subscribe((environment) => {
      this.environment = environment;
    });
  }
}

@NgModule({
  imports: [CommonModule, TranslateModule.forChild(), RtorrentStatusModule, RtorrentTorrentsModule, DirectDownloadModule],
  declarations: [SeedsComponent],
  exports: [SeedsComponent],
})
export class SeedsModule {}
