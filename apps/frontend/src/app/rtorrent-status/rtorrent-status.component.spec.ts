import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RtorrentStatusComponent } from './rtorrent-status.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RtorrentStatusService } from './rtorrent-status.service';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '../navbar/nav-bar.component.spec';

const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

describe('RtorrentStatusComponent', () => {
  let component: RtorrentStatusComponent;
  let fixture: ComponentFixture<RtorrentStatusComponent>;

  let httpMock: HttpTestingController;
  let rtorrentStatusService: RtorrentStatusService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RtorrentStatusComponent],
      imports: [HttpClientModule, HttpClientTestingModule, MatSnackBarModule, TranslateModule.forRoot()],
      providers: [
        { provide: NGXLogger, useClass: NGXLoggerMock },
        { provide: TranslateService, useClass: TranslateServiceStub }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RtorrentStatusComponent);
    component = fixture.componentInstance;

    rtorrentStatusService = TestBed.get(RtorrentStatusService);
    httpMock = TestBed.get(HttpTestingController);
  }));

  it('should create', async(() => {
    expect(component).toBeTruthy();
  }));

  it('rtorrentStatus should be update', async () => {
    const goodAnswer = {
      data: {
        down_rate: '28',
        down_total: '463360286085',
        up_rate: '191',
        up_total: '1293694778894',
        free_disk_space: 24319991808
      }
    };

    component.ngOnInit();

    const req = httpMock.expectOne(`${rtorrentStatusService.API_URL}`);
    expect(req.request.method).toBe('GET');
    req.flush(goodAnswer);

    await flushPromises();
    fixture.detectChanges();
    expect(component.rtorrentStatus).toEqual(goodAnswer.data);
  });
});
