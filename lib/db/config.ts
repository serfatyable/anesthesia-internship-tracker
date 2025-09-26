/**
 * Database configuration for optimal performance
 */

export const dbConfig = {
  // Connection pool settings
  connectionLimit: 20,
  acquireTimeoutMillis: 30000,
  timeout: 30000,
  idleTimeoutMillis: 30000,

  // Query optimization settings
  queryTimeout: 30000,
  statementTimeout: 30000,

  // Connection settings
  maxConnections: 20,
  minConnections: 5,

  // Performance settings
  enableQueryLogging: process.env.NODE_ENV === 'development',
  enableSlowQueryLogging: true,
  slowQueryThreshold: 1000, // 1 second

  // Retry settings
  maxRetries: 3,
  retryDelay: 1000,
};

export const queryOptimization = {
  // Batch size for bulk operations
  batchSize: 100,

  // Cache settings
  enableQueryCache: true,
  queryCacheSize: 1000,
  queryCacheTTL: 300000, // 5 minutes

  // Pagination settings
  defaultPageSize: 50,
  maxPageSize: 1000,
};

export const performanceMetrics = {
  // Enable performance monitoring
  enableMetrics: true,

  // Metrics collection intervals
  collectionInterval: 60000, // 1 minute

  // Slow query thresholds
  slowQueryThreshold: 1000, // 1 second
  verySlowQueryThreshold: 5000, // 5 seconds
};
