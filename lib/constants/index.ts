/**
 * Application constants to avoid magic numbers and strings
 */

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  ROTATIONS: 5 * 60 * 1000, // 5 minutes
  USER_SESSION: 30 * 60 * 1000, // 30 minutes
  PROCEDURES: 10 * 60 * 1000, // 10 minutes
} as const;

// API endpoints
export const API_ENDPOINTS = {
  LOGS: '/api/logs',
  PROGRESS: '/api/progress',
  VERIFICATIONS: '/api/verifications',
  VERIFY_QUEUE: '/api/verify-queue',
  PROCEDURES: '/api/procedures',
  SESSION: '/api/session',
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TUTOR: 'TUTOR',
  INTERN: 'INTERN',
} as const;

// Rotation states
export const ROTATION_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  ACTIVE: 'ACTIVE',
  FINISHED: 'FINISHED',
} as const;

// Verification statuses
export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// UI constants
export const UI = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  LOADING_TIMEOUT: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Database pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_OFFSET: 0,
} as const;

// Performance thresholds
export const PERFORMANCE = {
  DASHBOARD_LOAD_TIME_MS: 1500,
  VERIFY_QUEUE_FILTER_TIME_MS: 500,
  MAX_ROWS_FOR_OPTIMAL_PERFORMANCE: 1000,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOG_CREATED: 'Log entry created successfully',
  VERIFICATION_UPDATED: 'Verification updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production',
  ENABLE_BUNDLE_ANALYZER: false,
} as const;
