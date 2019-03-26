import { Component, NgModule, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

@NgModule({
  imports: [TranslateModule.forChild()],
  declarations: [FilesComponent],
  exports: [FilesComponent]
})
export class FilesModule {}
