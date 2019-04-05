import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarComponent, NavBarModule } from './nav-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DefaultLangChangeEvent, LangChangeEvent, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { AuthGuard } from '../authent/auth.guard';
import { NGXLogger, NGXLoggerMock } from 'ngx-logger';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { User } from '@seed-me-home/models';

const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
};

export class TranslateServiceStub {
  //noinspection JSUnusedGlobalSymbols
  public onTranslationChange: EventEmitter<TranslationChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onLangChange: EventEmitter<LangChangeEvent> = new EventEmitter();
  //noinspection JSUnusedGlobalSymbols
  public onDefaultLangChange: EventEmitter<DefaultLangChangeEvent> = new EventEmitter();

  //noinspection JSMethodCanBeStatic
  public get(key: any): any {
    //console.log('['+key+']');
    return of('[' + key + ']');
  }
}

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let authGard: AuthGuard;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavBarModule, HttpClientModule, HttpClientTestingModule, UserModule],
      declarations: [],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: TranslateService, useClass: TranslateServiceStub },
        { provide: NGXLogger, useClass: NGXLoggerMock },
        AuthGuard,
        UserService
      ]
    }).compileComponents();

    authGard = TestBed.get(AuthGuard);
    userService = TestBed.get(UserService);

    jest.spyOn(authGard, 'canActivate').mockImplementation(() => {
      return new Promise<boolean>(resolve => {
        resolve(true);
      });
    });
    jest.spyOn(userService, 'userObservable').mockImplementation(() => {
      return new BehaviorSubject<User>({
        name: 'name',
        family_name: 'family_name',
        given_name: 'given_name',
        locale: 'en',
        picture: 'picture_url',
        provider: 'google',
        providerId: '12345678',
        isAdmin: true
      });
    });

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should have Title, SEEDS and FILES button', () => {
    const compiled = fixture.debugElement.nativeElement;

    // console.log(compiled.querySelectorAll('.nav-bar-header a')[1].textContent);

    // first is title button
    expect(compiled.querySelector('.nav-bar-header a').textContent).toContain('[title][version]');

    expect(compiled.querySelectorAll('.nav-bar-header a').length).toEqual(3);

    // home icon and seeds label
    expect(compiled.querySelectorAll('.nav-bar-header a')[1].textContent).toContain('home[label.seeds]');

    // folder icon and files label
    expect(compiled.querySelectorAll('.nav-bar-header a')[2].textContent).toContain('folder[label.files]');
  });

  it('navigate to a button and it become accent', async () => {
    const compiled = fixture.debugElement.nativeElement;

    // console.log(compiled.querySelectorAll('.nav-bar-header a')[0].classList);
    // console.log(compiled.querySelectorAll('.nav-bar-header a')[1].classList);
    // console.log(compiled.querySelectorAll('.nav-bar-header a')[2].classList);

    // for now, seeds shouldn't be selected
    expect(compiled.querySelectorAll('.nav-bar-header a')[1].classList).not.toContain('mat-accent');

    // click on the seeds button
    compiled.querySelectorAll('.nav-bar-header a')[2].click();

    await flushPromises();
    fixture.detectChanges();

    // console.log(compiled.querySelectorAll('.nav-bar-header a')[0].classList);
    // console.log(compiled.querySelectorAll('.nav-bar-header a')[1].classList);
    // console.log(compiled.querySelectorAll('.nav-bar-header a')[2].classList);

    // now, seeds should be selected
    expect(compiled.querySelectorAll('.nav-bar-header a')[2].classList).toContain('mat-accent');
  });
});
