import { Logger, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';
import * as expressSession from 'express-session';
import * as passport from 'passport';

import { AppModule } from './app/app.module';
import { LoggingInterceptor } from './app/interceptors/logging.interceptor';
import { VersionInterceptor } from './app/interceptors/version.interceptor';

async function bootstrap() {
  let logger_levels: LogLevel[] = ['error', 'warn', 'log'];
  if (process.env.LOG_LEVEL) {
    switch (process.env.LOG_LEVEL.toUpperCase()) {
      case 'VERBOSE':
        logger_levels = ['error', 'warn', 'log', 'debug', 'verbose'];
        break;
      case 'DEBUG':
        logger_levels = ['error', 'warn', 'log', 'debug'];
        break;
      case 'LOG':
        logger_levels = ['error', 'warn', 'log'];
        break;
      default:
        logger_levels = ['error', 'warn'];
        break;
    }
  }

  console.log(
    `LOG_LEVEL : ${
      process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'LOG (by default)'
    }`
  );

  const app = await NestFactory.create(AppModule, {
    logger: logger_levels,
  });

  app.useGlobalInterceptors(new LoggingInterceptor(), new VersionInterceptor());

  // Add cors
  app.use(cors());

  app.use(
    expressSession({
      secret: 'SECRET_SESSION',
      resave: true,
      saveUninitialized: true,
    })
  );
  // configure passport (for authentication)
  app.use(passport.initialize());
  app.use(passport.session());

  const globalPrefix = 'api';
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
