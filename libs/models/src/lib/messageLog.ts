export class MessageLog {
  message: string;
  level: number;
  timestamp: Date;
  fileName: string;
  lineNumber: string;
  additional: [any];
}

export enum MessageLogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  LOG = 3,
  WARN = 4,
  ERROR = 5,
  FATAL = 6
}
