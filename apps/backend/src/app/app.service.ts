import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  static getData(): { message: string } {
    return { message: 'Welcome to backend!' };
  }
}
