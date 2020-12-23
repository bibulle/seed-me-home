import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesComponent } from './files.component';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationModule } from '../notification/notification.service';
import { FilesStatusModule } from './files-status/files-status.component';
import { FilesFilesModule } from './files-files/files-files.component';
import { By } from '@angular/platform-browser';

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;

  beforeEach(async(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NotificationModule,
        FilesStatusModule,
        FilesFilesModule,
      ],
      declarations: [FilesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have one status and 2 file lists', () => {
    expect(
      fixture.debugElement.queryAll(By.css('seed-me-home-files-status')).length
    ).toBe(1);

    expect(
      fixture.debugElement.queryAll(By.css('seed-me-home-files-files')).length
    ).toBe(2);
  });
});
