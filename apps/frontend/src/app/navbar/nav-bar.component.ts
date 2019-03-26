import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../authent/user.service';
import { User, Version } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule, MatIconModule, MatToolbarModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
  linksLeft: { path: string; label: string; icon: string; iconType: string; selected: boolean }[] = [];
  linksRight: { path: string; label: string; icon: string; iconType: string; selected: boolean }[] = [];

  user: User;
  private _currentUserSubscription: Subscription;

  version = new Version().version;

  constructor(private _router: Router, private _userService: UserService) {
    this._router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        this.linksLeft.forEach(link => {
          link.selected = '/' + link.path === data.urlAfterRedirects;
        });
        this.linksRight.forEach(link => {
          link.selected = '/' + link.path === data.urlAfterRedirects;
        });
      }
    });
  }

  ngOnInit() {
    this._currentUserSubscription = this._userService.userObservable().subscribe(user => {
      this.user = user;
      this.calculateMenus();
    });
  }

  ngOnDestroy(): void {
    if (this._currentUserSubscription) {
      this._currentUserSubscription.unsubscribe();
    }
  }

  private calculateMenus() {
    const newLinksLeft: { path: string; label: string; icon: string; iconType: string; selected: boolean }[] = [];
    const newLinksRight: { path: string; label: string; icon: string; iconType: string; selected: boolean }[] = [];
    this._router.config.forEach(obj => {
      // console.log(obj);
      if (!obj.redirectTo && obj.data && obj.data['menu']) {
        if (obj.data['right']) {
          newLinksRight.push({
            path: obj.path,
            label: obj.data['label'],
            icon: obj.data['icon'],
            iconType: obj.data['iconType'],
            selected: false
          });
        } else {
          newLinksLeft.push({
            path: obj.path,
            label: obj.data['label'],
            icon: obj.data['icon'],
            iconType: obj.data['iconType'],
            selected: false
          });
        }
      }
    });
    this.linksLeft = newLinksLeft;
    this.linksRight = newLinksRight;
  }
}

@NgModule({
  imports: [
    TranslateModule.forRoot(),
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    AppRoutingModule
  ],
  declarations: [NavBarComponent],
  exports: [NavBarComponent]
})
export class NavBarModule {}
