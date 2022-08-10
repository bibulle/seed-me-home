import { Component, NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FilesCleanerModule } from './files-cleaner/files-cleaner.component';
import { FilePath, FilesFilesModule } from './files-files/files-files.component';
import { FilesStatusModule } from './files-status/files-status.component';

@Component({
  selector: 'seed-me-home-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FilesComponent {
  public filePathTypes = FilePath;
}

@NgModule({
  imports: [TranslateModule.forChild(), FilesStatusModule, FilesCleanerModule, FilesFilesModule],
  declarations: [FilesComponent],
  exports: [FilesComponent],
})
export class FilesModule {}
