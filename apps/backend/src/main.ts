import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';
import * as expressSession from 'express-session';
import * as passport from 'passport';

import { AppModule } from './app/app.module';
import { LoggingInterceptor } from './app/interceptors/logging.interceptor';
import { VersionInterceptor } from './app/interceptors/version.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor(), new VersionInterceptor());

  // Add cors
  app.use(cors());

  // configure passport (for authentication)
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(
    expressSession({
      secret: 'SECRET_SESSION',
      resave: true,
      saveUninitialized: true,
    })
  );

  const globalPrefix = '';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 4002;
  await app
    .listen(port, () => {
      Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
    })
    .catch((reason) => {
      Logger.error('Error on serveur');
      Logger.error(reason);
    });
}

bootstrap();
