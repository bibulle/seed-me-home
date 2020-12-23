import { Controller, Logger, Post } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { MessageLog, MessageLogLevel } from '@seed-me-home/models';

@Controller('/api')
export class AppController {
  readonly logger = new Logger('FrontEnd');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  @Post('/logs')
  createLog(@Body() message: MessageLog) {
    let mess = message.message;
    if (message.additional && message.additional.length > 0) {
      mess += ' ' + JSON.stringify(message.additional[0]);
    }

    switch (message.level) {
      case MessageLogLevel.TRACE:
      case MessageLogLevel.DEBUG:
      case MessageLogLevel.INFO:
      case MessageLogLevel.LOG:
        this.logger.debug(
          mess + ' (' + message.fileName + message.lineNumber + ')'
        );
        break;
      case MessageLogLevel.WARN:
        this.logger.warn(
          mess + ' (' + message.fileName + message.lineNumber + ')'
        );
        break;
      case MessageLogLevel.ERROR:
      case MessageLogLevel.FATAL:
      default:
        this.logger.error(
          mess + ' (' + message.fileName + message.lineNumber + ')'
        );
        break;
    }

    return message;
  }
}
