import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserComponent } from './user.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '../navbar/nav-bar.component.spec';
import { UserModule } from './user.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule, UserModule],
      declarations: [],
      providers: [{ provide: TranslateService, useClass: TranslateServiceStub }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;

    component.user = {
      name: 'name',
      family_name: 'family_name',
      given_name: 'given_name',
      locale: 'en',
      picture: 'picture_url',
      provider: 'google',
      providerId: '12345678',
      isAdmin: true
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
