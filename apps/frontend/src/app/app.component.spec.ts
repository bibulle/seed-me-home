import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RtorrentStatusModule } from './rtorrent-status/rtorrent-status.component';
import { NavBarModule } from './navbar/nav-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';
import { TranslateModule } from '@ngx-translate/core';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NavBarModule, RtorrentStatusModule, RouterTestingModule, TranslateModule.forRoot()],
      declarations: [AppComponent],
      providers: [{ provide: NGXLogger, useClass: NGXLoggerMock }]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  //  it(`should have as title 'frontend'`, () => {
  //    const fixture = TestBed.createComponent(AppComponent);
  //    const app = fixture.debugElement.componentInstance;
  //    expect(app.title).toEqual('frontend');
  //  });

  //  it('should render title in a h1 tag', () => {
  //    const fixture = TestBed.createComponent(AppComponent);
  //    fixture.detectChanges();
  //    const compiled = fixture.debugElement.nativeElement;
  //    expect(compiled.querySelector('h1').textContent).toContain('Welcome to frontend!');
  //  });
});
