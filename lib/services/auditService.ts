import { prisma } from '@/lib/db';

export type AuditAction =
  | 'LOG_CREATED'
  | 'LOG_UPDATED'
  | 'LOG_DELETED'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED'
  | 'VERIFICATION_NEEDS_REVISION'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'ROLE_CHANGED'
  | 'REQUIREMENT_CREATED'
  | 'REQUIREMENT_UPDATED'
  | 'REQUIREMENT_DELETED'
  | 'ROTATION_CREATED'
  | 'ROTATION_UPDATED'
  | 'ROTATION_DELETED'
  | 'PROCEDURE_CREATED'
  | 'PROCEDURE_UPDATED'
  | 'PROCEDURE_DELETED';

export interface AuditLogData {
  actorUserId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  details?: string | undefined;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Log an audit event
   */
  async logAuditEvent(data: AuditLogData): Promise<void> {
    try {
      await prisma.audit.create({
        data: {
          actorUserId: data.actorUserId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details || null,
        },
      });
    } catch (error) {
      // Log audit errors but don't throw - audit failures shouldn't break the main flow
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log log entry creation
   */
  async logLogCreated(actorUserId: string, logEntryId: string, details?: string): Promise<void> {
    await this.logAuditEvent({
      actorUserId,
      action: 'LOG_CREATED',
      entity: 'LogEntry',
      entityId: logEntryId,
      details,
    });
  }

  /**
   * Log verification actions
   */
  async logVerificationAction(
    actorUserId: string,
    logEntryId: string,
    action: 'VERIFICATION_APPROVED' | 'VERIFICATION_REJECTED' | 'VERIFICATION_NEEDS_REVISION',
    details?: string,
  ): Promise<void> {
    await this.logAuditEvent({
      actorUserId,
      action,
      entity: 'LogEntry',
      entityId: logEntryId,
      details,
    });
  }

  /**
   * Log user management actions
   */
  async logUserAction(
    actorUserId: string,
    targetUserId: string,
    action: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'ROLE_CHANGED',
    details?: string,
  ): Promise<void> {
    await this.logAuditEvent({
      actorUserId,
      action,
      entity: 'User',
      entityId: targetUserId,
      details,
    });
  }

  /**
   * Log content management actions
   */
  async logContentAction(
    actorUserId: string,
    entityType: 'REQUIREMENT' | 'ROTATION' | 'PROCEDURE',
    entityId: string,
    action:
      | 'REQUIREMENT_CREATED'
      | 'REQUIREMENT_UPDATED'
      | 'REQUIREMENT_DELETED'
      | 'ROTATION_CREATED'
      | 'ROTATION_UPDATED'
      | 'ROTATION_DELETED'
      | 'PROCEDURE_CREATED'
      | 'PROCEDURE_UPDATED'
      | 'PROCEDURE_DELETED',
    details?: string,
  ): Promise<void> {
    await this.logAuditEvent({
      actorUserId,
      action,
      entity: entityType,
      entityId,
      details,
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getAuditLogs(entity: string, entityId: string, limit: number = 50) {
    return await prisma.audit.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit: number = 50) {
    return await prisma.audit.findMany({
      where: {
        actorUserId: userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }
}

export const auditService = new AuditService();
