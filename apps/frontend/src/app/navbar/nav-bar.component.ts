import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { User, Version } from '@seed-me-home/models';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule, MatIconModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { NotificationModule } from '../notification/notification.service';
import { UserModule } from '../user/user.module';

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
  updateNeeded = false;

  constructor(private _router: Router, private _userService: UserService) {
    this._router.events.subscribe(data => {
      //console.log(data.constructor.name);
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
      //console.log(this.user);
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
      //console.log(this.user);
      if (!obj.redirectTo && obj.data && obj.data['menu'] && (!obj.data['onlyAdmin'] || this.user.isAdmin)) {
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

  update() {
    location.reload();
  }
}

@NgModule({
  imports: [
    TranslateModule.forRoot(),
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    AppRoutingModule,
    NotificationModule,
    UserModule
  ],
  declarations: [NavBarComponent],
  exports: [NavBarComponent]
})
export class NavBarModule {}