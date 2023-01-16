import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DirectDownloadService } from './app/direct-download/direct-download.service';
import { FtpSeedService } from './app/ftp-seed/ftp-seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const ftpSeedService = app.get(FtpSeedService);
  ftpSeedService.intervalJob();

  const directDownloadService = app.get(DirectDownloadService);
  directDownloadService.intervalJob();

  await new Promise((r) => r);
}
bootstrap();
