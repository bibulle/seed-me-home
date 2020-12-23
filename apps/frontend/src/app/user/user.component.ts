import { Component, Input, OnInit } from '@angular/core';
import { User } from '@seed-me-home/models';
import { Config, UserService } from './user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'seed-me-home-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  @Input() user: User;

  private _currentConfigSubscription: Subscription;
  config: Config = new Config();

  constructor(
    private _router: Router,
    private readonly _userService: UserService
  ) {}

  ngOnInit() {
    this._currentConfigSubscription = this._userService
      .configObservable()
      .subscribe((rel) => {
        this.config = { ...this.config, ...rel };
      });
  }

  update() {
    location.reload();
  }

  logout() {
    this._userService.logout();

    // this._router.navigate(['']).catch();
  }

  toggleLang(lang: string) {
    this._userService.changeLanguage(lang);
  }
}
