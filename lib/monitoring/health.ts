// lib/monitoring/health.ts

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  uptime: number;
  version: string;
  checks: HealthCheck[];
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
  database?: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime?: number;
    error?: string;
  };
}

class HealthMonitor {
  private startTime: number;
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();

  constructor() {
    this.startTime = Date.now();
    this.registerDefaultChecks();
  }

  /**
   * Register a health check
   */
  register(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }

  /**
   * Get overall health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Run all health checks
    for (const [name, check] of this.checks) {
      try {
        const result = await check();
        checks.push(result);

        if (result.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (
          result.status === 'degraded' &&
          overallStatus === 'healthy'
        ) {
          overallStatus = 'degraded';
        }
      } catch (error) {
        checks.push({
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        });
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      checks,
      system: this.getSystemInfo(),
      database: await this.getDatabaseStatus(),
    };
  }

  /**
   * Get system information
   */
  private getSystemInfo() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
    const usedMemory = memoryUsage.heapUsed + memoryUsage.external;

    return {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: (usedMemory / totalMemory) * 100,
      },
      cpu: {
        usage: process.cpuUsage().user / 1000000, // Convert to seconds
      },
    };
  }

  /**
   * Get database status
   */
  private async getDatabaseStatus() {
    try {
      const start = Date.now();

      // Try to connect to database
      const { prisma } = await import('@/lib/db');
      await prisma.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - start;

      return {
        status: 'connected' as const,
        responseTime,
      };
    } catch (error) {
      return {
        status: 'error' as const,
        error:
          error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  /**
   * Register default health checks
   */
  private registerDefaultChecks() {
    // Memory usage check
    this.register('memory', async () => {
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
      const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
      const percentage = (usedMemory / totalMemory) * 100;

      if (percentage > 98) {
        return {
          name: 'memory',
          status: 'unhealthy',
          message: `Memory usage is ${percentage.toFixed(2)}%`,
          details: { percentage, used: usedMemory, total: totalMemory },
          timestamp: Date.now(),
        };
      } else if (percentage > 95) {
        return {
          name: 'memory',
          status: 'degraded',
          message: `Memory usage is ${percentage.toFixed(2)}%`,
          details: { percentage, used: usedMemory, total: totalMemory },
          timestamp: Date.now(),
        };
      }

      return {
        name: 'memory',
        status: 'healthy',
        message: `Memory usage is ${percentage.toFixed(2)}%`,
        details: { percentage, used: usedMemory, total: totalMemory },
        timestamp: Date.now(),
      };
    });

    // Uptime check
    this.register('uptime', async () => {
      const uptime = Date.now() - this.startTime;
      const uptimeHours = uptime / (1000 * 60 * 60);

      if (uptimeHours > 24 * 7) {
        // More than a week
        return {
          name: 'uptime',
          status: 'degraded',
          message: `Application has been running for ${uptimeHours.toFixed(2)} hours`,
          details: { uptime, uptimeHours },
          timestamp: Date.now(),
        };
      }

      return {
        name: 'uptime',
        status: 'healthy',
        message: `Application has been running for ${uptimeHours.toFixed(2)} hours`,
        details: { uptime, uptimeHours },
        timestamp: Date.now(),
      };
    });

    // Environment variables check
    this.register('environment', async () => {
      const requiredEnvVars = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
      ];

      const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

      if (missing.length > 0) {
        return {
          name: 'environment',
          status: 'unhealthy',
          message: `Missing required environment variables: ${missing.join(', ')}`,
          details: { missing },
          timestamp: Date.now(),
        };
      }

      return {
        name: 'environment',
        status: 'healthy',
        message: 'All required environment variables are set',
        details: { checked: requiredEnvVars },
        timestamp: Date.now(),
      };
    });
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();

// Export types
export type { HealthCheck, HealthStatus };
