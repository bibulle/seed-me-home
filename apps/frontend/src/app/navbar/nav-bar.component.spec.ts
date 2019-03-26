import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarComponent, NavBarModule } from './nav-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DefaultLangChangeEvent, LangChangeEvent, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NavBarModule, HttpClientModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: TranslateService, useClass: TranslateServiceStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
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

  it('navigate to a button and it become accent', () => {
    const compiled = fixture.debugElement.nativeElement;

    //console.log(compiled.querySelectorAll('.nav-bar-header a')[1].classList);

    // for now, seeds shouldn't be selected
    expect(compiled.querySelectorAll('.nav-bar-header a')[1].classList).not.toContain('mat-accent');

    // click on the seeds button
    compiled.querySelectorAll('.nav-bar-header a')[1].click();
    fixture.detectChanges();

    //console.log(compiled.querySelectorAll('.nav-bar-header a')[1].classList);

    // now, seeds should be selected
    expect(compiled.querySelectorAll('.nav-bar-header a')[1].classList).toContain('mat-accent');
  });
});
