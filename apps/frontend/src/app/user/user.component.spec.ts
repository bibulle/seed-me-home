import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { UserComponent } from './user.component';
import {
  DefaultLangChangeEvent,
  LangChangeEvent,
  TranslateModule,
  TranslateService,
  TranslationChangeEvent
} from '@ngx-translate/core';
import { UserModule } from './user.module';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule, MatIconModule, MatIconRegistry, MatMenuModule, MatToolbarModule } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Config, UserService } from './user.service';
import { of } from 'rxjs/internal/observable/of';
import { EventEmitter } from '@angular/core';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockUserService: UserService;

  beforeEach(async(() => {
    //noinspection JSIgnoredPromiseFromCall
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatIconModule,
        MatToolbarModule,
        MatMenuModule,
        MatButtonModule,
        TranslateModule,
        RouterTestingModule,
        UserModule
      ],
      declarations: [],
      providers: [
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: UserService, useClass: MockUserService }
      ]
    }).compileComponents();
  }));

  beforeEach(inject([MatIconRegistry, DomSanitizer], (matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) => {
    matIconRegistry
      .addSvgIcon('flag_fr', domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/fr.svg'))
      .addSvgIcon('flag_us', domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/us.svg'));

    fixture = TestBed.createComponent(UserComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;

    mockUserService = TestBed.get(UserService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a login button if no user set', async () => {
    const compiled = fixture.debugElement.nativeElement;

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.login').length).toBe(1);
    expect(compiled.querySelectorAll('.identity').length).toBe(0);

    expect(compiled.querySelectorAll('.login a').length).toBe(1);
    expect(compiled.querySelector('.login a').textContent).toContain('[this is a fake translation of label.login]');

    // if clicked, only reload
    window.location.reload = jest.fn();
    expect(window.location.reload).not.toHaveBeenCalled();
    fixture.ngZone.run(() => {
      compiled.parentNode.querySelectorAll('.login a')[0].click();
    });
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should have an image, a name and a menu if user set', async () => {
    const compiled = fixture.debugElement.nativeElement;

    component.user = {
      name: 'a display name',
      family_name: 'family_name',
      given_name: 'given_name',
      locale: 'en',
      picture: 'picture_url',
      provider: 'google',
      providerId: '12345678',
      isAdmin: true
    };

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.login').length).toBe(0);
    expect(compiled.querySelectorAll('.identity').length).toBe(1);

    expect(compiled.querySelectorAll('.identity img').length).toBe(1);
    expect(compiled.querySelector('.identity img').src).toBe('http://localhost/picture_url');

    expect(compiled.querySelectorAll('.identity .name').length).toBe(1);
    expect(compiled.querySelector('.identity .name').textContent).toContain('a display name');

    expect(compiled.querySelectorAll('.identity button').length).toBe(1);

    // for now, no menu
    expect(compiled.parentNode.querySelectorAll('.mat-menu-panel').length).toBe(0);
    // click
    fixture.ngZone.run(() => {
      compiled.querySelector('.identity button').click();
    });
    // menu should be shown
    expect(compiled.parentNode.querySelectorAll('.mat-menu-panel').length).toBe(1);
    expect(compiled.parentNode.querySelectorAll('.mat-menu-panel button').length).toBe(2);

    // click on change langue should do the job
    let spy = spyOn(mockUserService, 'changeLanguage');
    expect(spy).toBeCalledTimes(0);
    fixture.ngZone.run(() => {
      compiled.parentNode.querySelectorAll('.mat-menu-panel button')[1].click();
    });
    expect(spy).toBeCalledTimes(1);

    // click on logout should do the job
    spy = spyOn(mockUserService, 'logout');
    expect(spy).toBeCalledTimes(0);
    fixture.ngZone.run(() => {
      compiled.parentNode.querySelectorAll('.mat-menu-panel button')[0].click();
    });
    expect(spy).toBeCalledTimes(1);
  });
});

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
class MockUserService {
  //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  configObservable() {
    return of(new Config());
  }

  //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
  changeLanguage(language: string) {}
  logout() {}
}
