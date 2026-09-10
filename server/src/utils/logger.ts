import fs from 'fs';
import path from 'path';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
  }

  private writeToFile(message: string) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `${date}.log`);
    fs.appendFileSync(logFile, message);
  }

  info(message: string, meta?: any) {
    const formatted = this.formatMessage('INFO', message, meta);
    console.log(formatted.trim());
    this.writeToFile(formatted);
  }

  warn(message: string, meta?: any) {
    const formatted = this.formatMessage('WARN', message, meta);
    console.warn(formatted.trim());
    this.writeToFile(formatted);
  }

  error(message: string, meta?: any) {
    const formatted = this.formatMessage('ERROR', message, meta);
    console.error(formatted.trim());
    this.writeToFile(formatted);
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      const formatted = this.formatMessage('DEBUG', message, meta);
      console.debug(formatted.trim());
      this.writeToFile(formatted);
    }
  }
}

export const logger = new Logger();