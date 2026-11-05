/**
 * Professional Logging System for Production
 * Only logs in development, silent in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
  
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
    // In production, could send to error tracking service (Sentry, etc)
  },
  
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  
  debug: (...args: any[]) => {
    if (isDev) console.log(...args);
  }
};

// Export as Logger class for compatibility
export class Logger {
  static info(...args: any[]) {
    if (isDev) console.info(...args);
  }
  
  static error(...args: any[]) {
    if (isDev) console.error(...args);
  }
  
  static warn(...args: any[]) {
    if (isDev) console.warn(...args);
  }
  
  static debug(...args: any[]) {
    if (isDev) console.log(...args);
  }
}

export default logger;
