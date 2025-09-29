// lib/monitoring/errors.ts

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp: number;
  stack?: string | undefined;
  [key: string]: any;
}

interface ErrorReport {
  id: string;
  message: string;
  type: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  createdAt: number;
  updatedAt: number;
}

class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private maxErrors: number = 1000;
  private alertThresholds: Record<string, number> = {
    critical: 1,
    high: 5,
    medium: 10,
    low: 50,
  };

  /**
   * Report an error
   */
  report(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: ErrorReport['severity'] = 'medium'
  ): string {
    const errorId = this.generateErrorId();
    const now = Date.now();

    const errorReport: ErrorReport = {
      id: errorId,
      message: error.message,
      type: error.constructor.name,
      context: {
        ...context,
        timestamp: now,
        stack: error.stack || undefined,
      },
      severity,
      resolved: false,
      createdAt: now,
      updatedAt: now,
    };

    this.errors.push(errorReport);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Check if we should alert
    this.checkAlertThresholds(severity);

    // Log the error
    this.logError(errorReport);

    return errorId;
  }

  /**
   * Get error by ID
   */
  getError(id: string): ErrorReport | undefined {
    return this.errors.find(error => error.id === id);
  }

  /**
   * Get all errors
   */
  getErrors(filters?: {
    severity?: ErrorReport['severity'];
    resolved?: boolean;
    limit?: number;
  }): ErrorReport[] {
    let filtered = [...this.errors];

    if (filters?.severity) {
      filtered = filtered.filter(error => error.severity === filters.severity);
    }

    if (filters?.resolved !== undefined) {
      filtered = filtered.filter(error => error.resolved === filters.resolved);
    }

    if (filters?.limit) {
      filtered = filtered.slice(-filters.limit);
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Mark error as resolved
   */
  resolveError(id: string): boolean {
    const error = this.errors.find(e => e.id === id);
    if (error) {
      error.resolved = true;
      error.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    resolved: number;
    unresolved: number;
    bySeverity: Record<ErrorReport['severity'], number>;
    byType: Record<string, number>;
    recent: number; // Errors in last hour
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const stats = {
      total: this.errors.length,
      resolved: 0,
      unresolved: 0,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      } as Record<ErrorReport['severity'], number>,
      byType: {} as Record<string, number>,
      recent: 0,
    };

    for (const error of this.errors) {
      if (error.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }

      stats.bySeverity[error.severity]++;
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      if (error.createdAt > oneHourAgo) {
        stats.recent++;
      }
    }

    return stats;
  }

  /**
   * Clear resolved errors older than specified days
   */
  clearOldErrors(days: number = 7): number {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const initialLength = this.errors.length;

    this.errors = this.errors.filter(
      error => !error.resolved || error.createdAt > cutoff
    );

    return initialLength - this.errors.length;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(severity: ErrorReport['severity']): void {
    const threshold = this.alertThresholds[severity];
    if (!threshold) return;

    const recentErrors = this.getErrors({
      severity,
      resolved: false,
      limit: threshold,
    });

    if (recentErrors.length >= threshold) {
      this.sendAlert(severity, recentErrors.length);
    }
  }

  /**
   * Send alert (placeholder for real implementation)
   */
  private sendAlert(severity: ErrorReport['severity'], count: number): void {
    console.warn(`[ErrorMonitor] ALERT: ${count} ${severity} errors detected`);

    // In a real implementation, you would:
    // - Send email/SMS notifications
    // - Post to Slack/Discord
    // - Create tickets in your issue tracker
    // - Send to monitoring service (DataDog, New Relic, etc.)
  }

  /**
   * Log error
   */
  private logError(error: ErrorReport): void {
    const logLevel = this.getLogLevel(error.severity);
    const message = `[ErrorMonitor] ${error.type}: ${error.message}`;

    switch (logLevel) {
      case 'error':
        console.error(message, error.context);
        break;
      case 'warn':
        console.warn(message, error.context);
        break;
      case 'info':
        console.info(message, error.context);
        break;
      default:
        console.log(message, error.context);
    }
  }

  /**
   * Get log level based on severity
   */
  private getLogLevel(
    severity: ErrorReport['severity']
  ): 'error' | 'warn' | 'info' | 'log' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'log';
    }
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor();

// Export types
export type { ErrorContext, ErrorReport };
