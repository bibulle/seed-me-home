import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { FtpSeedService } from './app/ftp-seed/ftp-seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const ftpSeedService = app.get(FtpSeedService);
  ftpSeedService.intervalJob_FtpSeedService();

  await new Promise((r) => r);
}
bootstrap();
