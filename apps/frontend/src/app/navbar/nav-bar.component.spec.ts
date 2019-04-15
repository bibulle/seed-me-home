import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { NavBarComponent, NavBarModule } from './nav-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DefaultLangChangeEvent, LangChangeEvent, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { AuthGuard } from '../authent/auth.guard';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';
import { UserService } from '../user/user.service';
import { User } from '@seed-me-home/models';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer, HAMMER_LOADER } from '@angular/platform-browser';
import { Config } from 'codelyzer';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let authGard: AuthGuard;
  let userService: UserServiceMock;

  beforeEach(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavBarModule, HttpClientModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: NGXLogger, useClass: NGXLoggerMock },
        { provide: UserService, useClass: UserServiceMock },
        AuthGuard
      ]
    }).compileComponents();
  });

  beforeEach(inject([MatIconRegistry, DomSanitizer], (matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) => {
    matIconRegistry
      .addSvgIcon('flag_fr', domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/fr.svg'))
      .addSvgIcon('flag_us', domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/us.svg'));

    authGard = TestBed.get(AuthGuard);
    userService = TestBed.get(UserService);
    jest.spyOn(authGard, 'canActivate').mockImplementation(() => {
      return new Promise<boolean>(resolve => {
        resolve(true);
      });
    });

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Title, LOGIN button if no user', () => {
    const compiled = fixture.debugElement.nativeElement;

    expect(compiled.querySelectorAll('.nav-bar-header a').length).toEqual(2);

    // first is title button
    expect(compiled.querySelectorAll('.nav-bar-header a')[0].textContent).toContain(
      '[this is a fake translation of title][this is a fake translation of version]'
    );

    // face icon and login label
    expect(compiled.querySelectorAll('.nav-bar-header a')[1].textContent).toContain(
      'face[this is a fake translation of label.login]'
    );
  });

  it('should have Title, SEEDS and FILES button if user', () => {
    const compiled = fixture.debugElement.nativeElement;

    userService.user$.next({
      name: 'name',
      family_name: 'family_name',
      given_name: 'given_name',
      locale: 'en',
      picture: 'picture_url',
      provider: 'google',
      providerId: '12345678',
      isAdmin: true
    });

    fixture.detectChanges();

    // first is title button
    expect(compiled.querySelector('.nav-bar-header a').textContent).toContain(
      '[this is a fake translation of title][this is a fake translation of version]'
    );

    expect(compiled.querySelectorAll('.nav-bar-header a').length).toEqual(3);

    // home icon and seeds label
    expect(compiled.querySelectorAll('.nav-bar-header a')[1].textContent).toContain(
      'home[this is a fake translation of label.seeds]'
    );

    // folder icon and files label
    expect(compiled.querySelectorAll('.nav-bar-header a')[2].textContent).toContain(
      'folder[this is a fake translation of label.files]'
    );
  });

  it('navigate to a button and it become accent', () => {
    const compiled = fixture.debugElement.nativeElement;

    userService.user$.next({
      name: 'name',
      family_name: 'family_name',
      given_name: 'given_name',
      locale: 'en',
      picture: 'picture_url',
      provider: 'google',
      providerId: '12345678',
      isAdmin: true
    });

    fixture.detectChanges();

    // for now, seeds shouldn't be selected
    expect(compiled.querySelectorAll('.nav-bar-header a')[1].classList).not.toContain('mat-accent');

    // click on the seeds button
    compiled.querySelectorAll('.nav-bar-header a')[2].click();
    fixture.detectChanges();

    // now, seeds should be selected
    expect(compiled.querySelectorAll('.nav-bar-header a')[2].classList).toContain('mat-accent');
  });

  it('button update should appear if necessary and click should reload', () => {
    const compiled = fixture.debugElement.nativeElement;

    expect(compiled.querySelectorAll('#nav-bar-reload').length).toEqual(0);

    component.updateNeeded = true;
    fixture.detectChanges();

    expect(compiled.querySelectorAll('#nav-bar-reload').length).toEqual(1);

    const spyNavigation = jest.spyOn(location, 'reload').mockReturnThis();

    compiled.querySelector('#nav-bar-reload').click();
    fixture.detectChanges();

    expect(spyNavigation).toHaveBeenCalledTimes(1);
  });
});

class UserServiceMock {
  user$: Subject<User> = new Subject<User>();
  config$: Subject<Config> = new Subject<Config>();
  //noinspection JSUnusedGlobalSymbols
  userObservable(): Observable<User> {
    return this.user$;
  }
  //noinspection JSUnusedGlobalSymbols
  configObservable(): Observable<Config> {
    return this.config$;
  }
}
class TranslateServiceStub {
  //noinspection JSUnusedGlobalSymbols
  public onTranslationChange: EventEmitter<TranslationChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onLangChange: EventEmitter<LangChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onDefaultLangChange: EventEmitter<DefaultLangChangeEvent> = new EventEmitter();
  public use() {}
  //noinspection JSMethodCanBeStatic
  public get(key: any): any {
    return of('[this is a fake translation of ' + key + ']');
  }
}