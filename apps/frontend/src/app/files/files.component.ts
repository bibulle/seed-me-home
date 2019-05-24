import { Component, NgModule, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FilesStatusModule } from './files-status/files-status.component';
import { FilePath, FilesFilesModule } from './files-files/files-files.component';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  public filePathTypes = FilePath;

  constructor() {}

  ngOnInit() {}
}

@NgModule({
  imports: [TranslateModule.forChild(), FilesStatusModule, FilesFilesModule],
  declarations: [FilesComponent],
  exports: [FilesComponent]
})
export class FilesModule {}
