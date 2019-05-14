/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/

import { NestFactory } from '@nestjs/core';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import * as cors from 'cors';

import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
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
      saveUninitialized: true
    })
  );
  // start the main server
  //app.setGlobalPrefix(``);
  const port = process.env.port || 4000;
  await app
    .listen(port, () => {
      Logger.log(`Listening at http://localhost:${port}`);
    })
    .catch(reason => {
      Logger.error('Error on serveur');
      Logger.error(reason);
    });
}

bootstrap();
