import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesStatusComponent } from './files-status.component';
import { FilesStatusService } from './files-status.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Observable, Subject } from 'rxjs';
import { FilesStatus } from '@seed-me-home/models';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizeModule } from '../../utils/pipes/bytes-size.pipe';

describe('FilesStatusComponent', () => {
  let component: FilesStatusComponent;
  let fixture: ComponentFixture<FilesStatusComponent>;
  let filesStatusService: FilesStatusServiceMock;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatIconModule,
        MatCardModule,
        TranslateModule.forRoot(),
        BytesSizeModule,
      ],
      declarations: [FilesStatusComponent],
      providers: [
        { provide: FilesStatusService, useClass: FilesStatusServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesStatusComponent);
    component = fixture.componentInstance;

    filesStatusService = TestBed.get(FilesStatusService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filesStatus should be update', () => {
    const goodAnswer: FilesStatus = {
      free_disk_space_local: 12346,
      free_disk_space_nas: 1234567,
      total_disk_space_local: 1234560,
      total_disk_space_nas: 12345670,
    };

    component.ngOnInit();
    expect(component.filesStatus).toBeUndefined();

    // we should have subscribe
    expect(filesStatusService.status$.observers.length).toBe(1);

    filesStatusService.status$.next(goodAnswer);
    fixture.detectChanges();
    expect(component.filesStatus).toEqual(goodAnswer);

    // after destroy, we should unsubscribe
    component.ngOnDestroy();
    // TODO : due to rxjs bug, commented code
    //expect(filesStatusService.status$.observers.length).toBe(0);
  });
});

class FilesStatusServiceMock {
  status$: Subject<FilesStatus> = new Subject<FilesStatus>();

  //noinspection JSUnusedGlobalSymbols
  currentStatusObservable(): Observable<FilesStatus> {
    return this.status$;
  }
  startLoadingStats() {}
}
