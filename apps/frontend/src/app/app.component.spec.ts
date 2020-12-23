import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NGXLogger } from 'ngx-logger';
import { NGXLoggerMock } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Config, UserService } from './user/user.service';
import { Observable, Subject } from 'rxjs';
import { User } from '@seed-me-home/models';
import { Component } from '@angular/core';
import { MaterialModule } from './material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

let component: AppComponent;
let fixture: ComponentFixture<AppComponent>;
let mockUserService: UserServiceMock;

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      declarations: [AppComponent, MockNavBarComponent],
      providers: [
        { provide: NGXLogger, useClass: NGXLoggerMock },
        { provide: UserService, useClass: UserServiceMock },
      ],
    }).compileComponents();

    mockUserService = TestBed.get(UserService);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should display nothing if no user', () => {
    const compiled = fixture.debugElement.nativeElement;

    expect(mockUserService.user$.observers.length).toBe(1);
    expect(compiled.querySelectorAll('router-outlet').length).toEqual(0);

    mockUserService.user$.next({
      name: 'name',
      family_name: 'family_name',
      given_name: 'given_name',
      locale: 'en',
      picture: 'picture_url',
      provider: 'google',
      providerId: '12345678',
      isAdmin: true,
    });
    fixture.detectChanges();
    expect(compiled.querySelectorAll('router-outlet').length).toEqual(1);

    component.ngOnDestroy();
    fixture.detectChanges();
    expect(mockUserService.user$.observers.length).toBe(0);
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
  isAuthenticate() {
    return true;
  }
}

@Component({
  selector: 'seed-me-home-nav-bar',
  template: '<p>MockNavBarComponent</p>',
})
class MockNavBarComponent {}
