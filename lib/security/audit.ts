/**
 * Comprehensive security audit and monitoring system
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { monitoring } from '@/lib/utils/monitoring';

type JsonRecord = Record<string, unknown>;

interface AuditEvent {
  id: string;
  actorUserId: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldValues: JsonRecord | null;
  newValues: JsonRecord | null;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata: JsonRecord | null;
}

interface SecurityEvent {
  type:
    | 'LOGIN'
    | 'LOGOUT'
    | 'PERMISSION_DENIED'
    | 'SUSPICIOUS_ACTIVITY'
    | 'DATA_ACCESS'
    | 'DATA_MODIFICATION';
  userId: string | undefined;
  ipAddress: string;
  userAgent: string;
  details: JsonRecord;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
}

class SecurityAuditService {
  private securityEvents: SecurityEvent[] = [];
  private maxEvents = 10000;

  // Record audit event
  async recordAuditEvent(
    actorUserId: string | null,
    action: string,
    entity: string,
    entityId: string,
    oldValues: JsonRecord | null = null,
    newValues: JsonRecord | null = null,
    request: NextRequest,
    metadata?: JsonRecord,
  ): Promise<void> {
    try {
      const auditEvent: Omit<AuditEvent, 'id' | 'timestamp'> = {
        actorUserId,
        action,
        entity,
        entityId,
        oldValues,
        newValues,
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: metadata ?? null,
      };

      // Store in database
      await prisma.audit.create({
        data: {
          ...auditEvent,
          timestamp: new Date(),
          actorUserId: auditEvent.actorUserId ?? '',
        },
      });

      // Record metrics
      monitoring.recordMetric('audit.event', 1, { action, entity });

      logger.info('Audit event recorded', {
        operation: 'audit',
        action,
        entity,
        actorUserId,
      });
    } catch (error) {
      logger.error('Failed to record audit event', {
        operation: 'audit',
        error: error instanceof Error ? error.message : 'Unknown error',
        action,
        entity,
        entityId,
      });
    }
  }

  // Record security event
  recordSecurityEvent(
    type: SecurityEvent['type'],
    details: JsonRecord,
    request: NextRequest,
    severity: SecurityEvent['severity'] = 'MEDIUM',
    userId?: string,
  ): void {
    const securityEvent: SecurityEvent = {
      type,
      userId: userId ?? undefined,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      details,
      severity,
      timestamp: new Date(),
    };

    this.securityEvents.push(securityEvent);

    // Keep only recent events
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents);
    }

    // Record metrics
    monitoring.recordMetric('security.event', 1, { type, severity });

    // Log based on severity
    const logLevel = severity === 'CRITICAL' ? 'error' : severity === 'HIGH' ? 'warn' : 'info';

    logger[logLevel](`Security event: ${type}`, {
      operation: 'security_audit',
      type,
      severity,
      userId: userId ?? undefined,
      ipAddress: securityEvent.ipAddress,
    });

    // Alert for critical events
    if (severity === 'CRITICAL') {
      this.alertCriticalEvent(securityEvent);
    }
  }

  // Get client IP address
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';

    return 'unknown';
  }

  // Alert critical security events
  private alertCriticalEvent(event: SecurityEvent): void {
    // In a real application, you would send alerts via email, Slack, etc.
    logger.error('CRITICAL SECURITY EVENT', {
      operation: 'security_alert',
      type: event.type,
      userId: event.userId ?? undefined,
      ipAddress: event.ipAddress,
      // omit details to satisfy LogContext
      timestamp: event.timestamp,
    });

    // Record critical event metric
    monitoring.recordMetric('security.critical_event', 1, { type: event.type });
  }

  // Get audit trail for an entity
  async getAuditTrail(entity: string, entityId: string): Promise<AuditEvent[]> {
    try {
      const auditEvents = await prisma.audit.findMany({
        where: { entity, entityId },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      // Ensure required fields with defaults
      return auditEvents.map((e) => ({
        id: e.id,
        actorUserId: e.actorUserId ?? null,
        action: e.action,
        entity: e.entity,
        entityId: e.entityId,
        oldValues: (e as unknown as { oldValues?: JsonRecord }).oldValues ?? null,
        newValues: (e as unknown as { newValues?: JsonRecord }).newValues ?? null,
        ipAddress: (e as unknown as { ipAddress?: string }).ipAddress ?? 'unknown',
        userAgent: (e as unknown as { userAgent?: string }).userAgent ?? 'unknown',
        timestamp: e.timestamp,
        metadata: (e as unknown as { metadata?: JsonRecord }).metadata ?? null,
      }));
    } catch (error) {
      logger.error('Failed to get audit trail', {
        operation: 'audit_trail',
        error: error instanceof Error ? error.message : 'Unknown error',
        entity,
        entityId,
      });
      return [];
    }
  }

  // Get security events
  getSecurityEvents(timeRange?: { start: Date; end: Date }): SecurityEvent[] {
    if (!timeRange) return [...this.securityEvents];

    return this.securityEvents.filter(
      (event) => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end,
    );
  }

  // Get security statistics
  getSecurityStats(timeRange?: { start: Date; end: Date }): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    criticalEvents: number;
    suspiciousIPs: string[];
  } {
    const events = timeRange ? this.getSecurityEvents(timeRange) : this.securityEvents;

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    events.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
    });

    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([ip, count]) => count > 10 && ip)
      .map(([ip]) => ip);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      criticalEvents: eventsBySeverity['CRITICAL'] || 0,
      suspiciousIPs,
    };
  }

  // Detect suspicious activity
  detectSuspiciousActivity(request: NextRequest, userId?: string): boolean {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /zap/i,
      /burp/i,
      /scanner/i,
      /bot/i,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
      this.recordSecurityEvent(
        'SUSPICIOUS_ACTIVITY',
        { reason: 'Suspicious user agent', userAgent },
        request,
        'HIGH',
        userId,
      );
      return true;
    }

    // Check for rapid requests from same IP
    const recentEvents = this.securityEvents.filter(
      (event) => event.ipAddress === ip && Date.now() - event.timestamp.getTime() < 60000, // Last minute
    );

    if (recentEvents.length > 20) {
      this.recordSecurityEvent(
        'SUSPICIOUS_ACTIVITY',
        { reason: 'Rapid requests', count: recentEvents.length },
        request,
        'MEDIUM',
        userId,
      );
      return true;
    }

    return false;
  }

  // Cleanup old events
  cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);

    this.securityEvents = this.securityEvents.filter((event) => event.timestamp > cutoff);
  }
}

// Global security audit service
export const securityAudit = new SecurityAuditService();

// Convenience functions
export const recordAuditEvent = (
  actorUserId: string | null,
  action: string,
  entity: string,
  entityId: string,
  oldValues: JsonRecord | null = null,
  newValues: JsonRecord | null = null,
  request: NextRequest,
  metadata?: JsonRecord,
) =>
  securityAudit.recordAuditEvent(
    actorUserId,
    action,
    entity,
    entityId,
    oldValues,
    newValues,
    request,
    metadata,
  );

export const recordSecurityEvent = (
  type: SecurityEvent['type'],
  details: JsonRecord,
  request: NextRequest,
  severity: SecurityEvent['severity'] = 'MEDIUM',
  userId?: string,
) => securityAudit.recordSecurityEvent(type, details, request, severity, userId);

// Cleanup old events periodically
setInterval(
  () => {
    securityAudit.cleanup();
  },
  24 * 60 * 60 * 1000,
); // Daily cleanup
