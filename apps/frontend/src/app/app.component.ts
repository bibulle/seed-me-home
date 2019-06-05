import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { Subscription } from 'rxjs';
import { UserService } from './user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private _currentUserSubscription: Subscription;

  isAuthenticated = false;

  constructor(
    private _translate: TranslateService,
    private _matIconRegistry: MatIconRegistry,
    private _domSanitizer: DomSanitizer,
    private _userService: UserService
  ) {
    this._translate.setDefaultLang('en');

    this._matIconRegistry
      .addSvgIcon('flag_fr', this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/fr.svg'))
      .addSvgIcon('flag_us', this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/us.svg'));
  }

  ngOnInit() {
    this._currentUserSubscription = this._userService.userObservable().subscribe(() => {
      //console.log(this.user);
      this.isAuthenticated = this._userService.isAuthenticate();
    });
  }

  ngOnDestroy() {
    if (this._currentUserSubscription) {
      this._currentUserSubscription.unsubscribe();
    }
  }
}
