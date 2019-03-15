import { Component } from '@angular/core';
import { Status } from '@seed-me-home/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  status: Status;
}
