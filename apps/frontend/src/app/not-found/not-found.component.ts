import { Component, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'seed-me-home2-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

@NgModule({
  imports: [],
  declarations: [NotFoundComponent],
})
export class NotFoundModule {}
