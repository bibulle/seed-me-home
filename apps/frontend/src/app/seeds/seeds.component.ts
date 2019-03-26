import { Component, NgModule, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [TranslateModule.forChild()],
  declarations: [SeedsComponent],
  exports: [SeedsComponent]
})
export class SeedsModule {}
