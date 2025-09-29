/**
 * Comprehensive logging system with structured logging and log levels
 */
import { monitoring } from './monitoring';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogContext {
  userId?: string | undefined;
  requestId?: string;
  sessionId?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, unknown> | undefined;
  // Additional context properties for different logging scenarios
  method?: string;
  path?: string;
  statusCode?: number;
  query?: string;
  action?: string;
  event?: string;
  metric?: string;
  value?: number;
  error?: string;
  key?: string;
  pattern?: string;
  cacheKey?: string;
  memoryUsage?: number;
  heapGrowth?: number;
  operationName?: string;
  context?: string;
  type?: string;
  // Additional properties for various logging scenarios
  errors?: string;
  entity?: string;
  severity?: string;
  ipAddress?: string;
  memoryDelta?: number;
  maxResults?: number;
  maxMemoryUsage?: number;
  age?: number;
  result?: any;
  page?: string;
  eventName?: string;
  externalGrowth?: number;
  errorId?: string;
  status?: string;
  message?: string;
  responseTime?: number;
  level?: string;
  retryCount?: number;
  url?: string;
  userAgent?: string;
  // Allow additional ad-hoc context keys used by various modules
  logEntryId?: string;
  // generic index signature for optional context enrichment (kept narrow by usage)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogContext;
  error?: Error | undefined;
  stack?: string | undefined;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.minLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.minLevel;
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error || undefined,
      stack: error?.stack,
    };
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const levelName = LogLevel[entry.level];
    const prefix = `[${entry.timestamp}] [${levelName}]`;

    if (entry.error) {
      console.error(`${prefix} ${entry.message}`, {
        context: entry.context,
        error: entry.error,
        stack: entry.stack,
      });
    } else {
      const logMethod = entry.level <= LogLevel.WARN ? console.warn : console.log;
      logMethod(`${prefix} ${entry.message}`, entry.context);
    }

    // Record metrics for monitoring
    monitoring.recordMetric('logger.entries', 1, {
      level: levelName.toLowerCase(),
      hasError: entry.error ? 'true' : 'false',
    });
  }

  error(message: string, context: LogContext = {}, error?: Error): void {
    const entry = this.formatLog(LogLevel.ERROR, message, context, error);
    this.writeLog(entry);

    // Record error metrics
    if (error) {
      monitoring.recordError(error, 'logger.error');
    }
  }

  warn(message: string, context: LogContext = {}): void {
    const entry = this.formatLog(LogLevel.WARN, message, context);
    this.writeLog(entry);
  }

  info(message: string, context: LogContext = {}): void {
    const entry = this.formatLog(LogLevel.INFO, message, context);
    this.writeLog(entry);
  }

  debug(message: string, context: LogContext = {}): void {
    const entry = this.formatLog(LogLevel.DEBUG, message, context);
    this.writeLog(entry);
  }

  // Specialized logging methods
  apiRequest(method: string, path: string, context: LogContext = {}): void {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      operation: 'api_request',
      method,
      path,
    });
  }

  apiResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context: LogContext = {},
  ): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const entry = this.formatLog(level, `API Response: ${method} ${path} ${statusCode}`, {
      ...context,
      operation: 'api_response',
      method,
      path,
      statusCode,
      duration,
    });
    this.writeLog(entry);
  }

  databaseQuery(query: string, duration: number, context: LogContext = {}): void {
    this.debug(`Database Query: ${query}`, {
      ...context,
      operation: 'database_query',
      query: query.substring(0, 100), // Truncate long queries
      duration,
    });
  }

  userAction(action: string, userId: string, context: LogContext = {}): void {
    this.info(`User Action: ${action}`, {
      ...context,
      operation: 'user_action',
      action,
      userId,
    });
  }

  securityEvent(event: string, context: LogContext = {}): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      operation: 'security_event',
      event,
    });
  }

  performanceMetric(metric: string, value: number, context: LogContext = {}): void {
    this.debug(`Performance: ${metric} = ${value}ms`, {
      ...context,
      operation: 'performance_metric',
      metric,
      value,
    });
  }

  // Additional logging methods for API routes
  request(method: string, path: string, duration: number, context: LogContext = {}): void {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      method,
      path,
      duration,
    });
  }

  verificationDecision(
    action: string,
    logEntryId: string,
    reason?: string,
    context: LogContext = {},
  ): void {
    this.info(`Verification ${action}: ${logEntryId}`, {
      ...context,
      action,
      logEntryId,
      reason,
    });
  }

  // Batch logging for high-volume operations
  batchLog(entries: Array<{ level: LogLevel; message: string; context?: LogContext }>): void {
    entries.forEach(({ level, message, context = {} }) => {
      const entry = this.formatLog(level, message, context);
      this.writeLog(entry);
    });
  }

  // Create a child logger with persistent context
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalWriteLog = childLogger.writeLog.bind(childLogger);

    childLogger.writeLog = (entry: LogEntry) => {
      const mergedContext = { ...defaultContext, ...entry.context };
      const mergedEntry = { ...entry, context: mergedContext };
      originalWriteLog(mergedEntry);
    };

    return childLogger;
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience functions
export const logError = (message: string, context?: LogContext, error?: Error) =>
  logger.error(message, context, error);

export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);

// Request-scoped logger
export function createRequestLogger(requestId: string, userId?: string): Logger {
  return logger.child({ requestId, userId });
}

// Performance logging decorator
export function logPerformance<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string,
  loggerInstance: Logger = logger,
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result
          .then((resolved) => {
            const duration = performance.now() - start;
            loggerInstance.performanceMetric(operationName, duration);
            return resolved;
          })
          .catch((error) => {
            const duration = performance.now() - start;
            loggerInstance.error(`${operationName} failed`, { duration }, error);
            throw error;
          });
      }

      const duration = performance.now() - start;
      loggerInstance.performanceMetric(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      loggerInstance.error(`${operationName} failed`, { duration }, error as Error);
      throw error;
    }
  }) as T;
}
