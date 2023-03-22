import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DirectDownloadService } from './app/direct-download/direct-download.service';
import { FtpSeedService } from './app/ftp-seed/ftp-seed.service';

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

  console.log(`LOG_LEVEL : ${process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'LOG (by default)'}`);
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: logger_levels,
  });

  const ftpSeedService = app.get(FtpSeedService);
  ftpSeedService.intervalJob();

  const directDownloadService = app.get(DirectDownloadService);
  directDownloadService.intervalJob();

  await new Promise((r) => r);
}
bootstrap();
