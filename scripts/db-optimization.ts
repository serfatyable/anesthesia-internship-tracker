#!/usr/bin/env tsx

/**
 * Database Optimization Script
 * Analyzes and optimizes database performance
 */

import { prisma } from '../lib/db';
import { performance } from 'perf_hooks';

interface QueryAnalysis {
  query: string;
  duration: number;
  rows: number;
  optimization?: string;
}

class DatabaseOptimizer {
  private queries: QueryAnalysis[] = [];

  async analyzeQuery<T>(name: string, queryFn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await queryFn();
    const duration = performance.now() - start;
    const rows = Array.isArray(result) ? result.length : 1;

    this.queries.push({
      query: name,
      duration,
      rows,
    });

    console.log(`📊 ${name}: ${duration.toFixed(2)}ms (${rows} rows)`);
    return result;
  }

  async analyzeCommonQueries() {
    console.log('🔍 Analyzing common database queries...\n');

    // 1. User queries
    await this.analyzeQuery('Get all users', () =>
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
      })
    );

    // 2. Rotation queries
    await this.analyzeQuery('Get all rotations with procedures', () =>
      prisma.rotation.findMany({
        include: {
          procedures: {
            include: {
              requirements: true,
            },
          },
        },
      })
    );

    // 3. Log entry queries (most frequent)
    await this.analyzeQuery('Get recent log entries', () =>
      prisma.logEntry.findMany({
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        include: {
          procedure: {
            include: {
              rotation: true,
            },
          },
          verification: true,
        },
        orderBy: { date: 'desc' },
        take: 1000,
      })
    );

    // 4. Verification queries
    await this.analyzeQuery('Get pending verifications', () =>
      prisma.verification.findMany({
        where: { status: 'PENDING' },
        include: {
          logEntry: {
            include: {
              procedure: {
                include: {
                  rotation: true,
                },
              },
              intern: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      })
    );

    // 5. Progress calculation query (most complex)
    await this.analyzeQuery('Complex progress calculation', async () => {
      const rotations = await prisma.rotation.findMany({
        include: {
          procedures: {
            include: {
              requirements: true,
            },
          },
        },
      });

      const logEntries = await prisma.logEntry.findMany({
        where: {
          date: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
          },
        },
        include: {
          procedure: {
            include: {
              rotation: true,
            },
          },
          verification: true,
        },
        orderBy: { date: 'desc' },
        take: 5000,
      });

      return { rotations, logEntries };
    });
  }

  async suggestOptimizations() {
    console.log('\n💡 Optimization Suggestions:\n');

    const slowQueries = this.queries.filter(q => q.duration > 100);
    const frequentQueries = this.queries.filter(q => q.rows > 100);

    if (slowQueries.length > 0) {
      console.log('🐌 Slow Queries (>100ms):');
      slowQueries.forEach(q => {
        console.log(`  - ${q.query}: ${q.duration.toFixed(2)}ms`);
      });
    }

    if (frequentQueries.length > 0) {
      console.log('📈 High-Volume Queries (>100 rows):');
      frequentQueries.forEach(q => {
        console.log(`  - ${q.query}: ${q.rows} rows`);
      });
    }

    console.log('\n🔧 Recommended Optimizations:');
    console.log('1. Add composite indexes for frequently queried combinations');
    console.log('2. Implement query result caching');
    console.log('3. Use database views for complex aggregations');
    console.log('4. Optimize N+1 query patterns');
    console.log('5. Add database connection pooling');
  }

  async createOptimizedIndexes() {
    console.log('\n🔨 Creating optimized indexes...\n');

    try {
      // Add composite indexes for common query patterns
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_logs_intern_procedure_date 
        ON LogEntry(internId, procedureId, date);
      `;
      console.log('✅ Created index: idx_logs_intern_procedure_date');

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_verifications_status_timestamp 
        ON Verification(status, timestamp);
      `;
      console.log('✅ Created index: idx_verifications_status_timestamp');

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_user_role_email 
        ON User(role, email);
      `;
      console.log('✅ Created index: idx_user_role_email');

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_requirements_rotation_procedure 
        ON Requirement(rotationId, procedureId);
      `;
      console.log('✅ Created index: idx_requirements_rotation_procedure');

      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_logs_date_desc 
        ON LogEntry(date DESC);
      `;
      console.log('✅ Created index: idx_logs_date_desc');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }

  async analyzeIndexUsage() {
    console.log('\n📊 Analyzing index usage...\n');

    try {
      // Get database statistics
      const stats = await prisma.$queryRaw`
        SELECT 
          name,
          sql
        FROM sqlite_master 
        WHERE type = 'index' 
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name;
      `;

      console.log('📋 Current Indexes:');
      (stats as any[]).forEach((index: any) => {
        console.log(`  - ${index.name}: ${index.sql}`);
      });
    } catch (error) {
      console.error('❌ Error analyzing indexes:', error);
    }
  }

  async generateReport() {
    console.log('\n📊 Database Optimization Report\n');
    console.log('='.repeat(50));

    const totalDuration = this.queries.reduce((sum, q) => sum + q.duration, 0);
    const avgDuration = totalDuration / this.queries.length;
    const totalRows = this.queries.reduce((sum, q) => sum + q.rows, 0);

    console.log(`Total Queries Analyzed: ${this.queries.length}`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`Total Rows Processed: ${totalRows}`);

    console.log('\nQuery Performance Summary:');
    this.queries
      .sort((a, b) => b.duration - a.duration)
      .forEach((q, i) => {
        const status = q.duration > 100 ? '🐌' : q.duration > 50 ? '⚠️' : '✅';
        console.log(
          `${i + 1}. ${status} ${q.query}: ${q.duration.toFixed(2)}ms`
        );
      });
  }
}

async function main() {
  const optimizer = new DatabaseOptimizer();

  try {
    await optimizer.analyzeCommonQueries();
    await optimizer.suggestOptimizations();
    await optimizer.createOptimizedIndexes();
    await optimizer.analyzeIndexUsage();
    await optimizer.generateReport();

    console.log('\n✅ Database optimization analysis complete!');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();

export { DatabaseOptimizer };
