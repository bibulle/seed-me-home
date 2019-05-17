import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuard, AuthGuardAdmin } from './authent/auth.guard';
import { SeedsModule } from './seeds/seeds.component';
import { NotFoundModule } from './not-found/not-found.component';
import { NavBarModule } from './navbar/nav-bar.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import { FilesModule } from './files/files.component';
import { NotificationService } from './notification/notification.service';
import { LoggerModule, NGXLogger, NgxLoggerLevel } from 'ngx-logger';
import { environment } from '../environments/environment';
import { UserService } from './user/user.service';
import { JwtModule } from '@auth0/angular-jwt';
import { RefreshTokenInterceptor } from './interceptors/refresh-token.interceptor';

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  constructor(private readonly logger: NGXLogger) {}

  handle(params: MissingTranslationHandlerParams) {
    this.logger.warn('Missing translation', params.key);
    return '?' + params.key + '?';
  }
}

registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEn, 'en');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: UserService.tokenGetter,
        whitelistedDomains: ['localhost:4000' as string | RegExp, 'seeds.bibulle.fr', new RegExp('^null$')]
        //        whitelistedDomains: new Array(new RegExp('^null$'))
      }
    }),
    MaterialModule,
    AppRoutingModule,
    NavBarModule,
    SeedsModule,
    FilesModule,
    NotFoundModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler,
        deps: [NGXLogger]
      }
      // useDefaultLang: false
    }),
    LoggerModule.forRoot({
      serverLoggingUrl: environment.serverUrl + 'api/logs',
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.WARN
    })
  ],
  providers: [
    AuthGuard,
    AuthGuardAdmin,
    NotificationService,
    { provide: HTTP_INTERCEPTORS, useClass: RefreshTokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
