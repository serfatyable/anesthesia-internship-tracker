/**
 * Comprehensive API type definitions
 */

// Base API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  requestId?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  requestId?: string;
  details?: unknown;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse {
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

// User types
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  idNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'INTERN' | 'TUTOR' | 'ADMIN';

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  idNumber: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  idNumber?: string;
  role?: UserRole;
}

// Authentication types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: User;
}

export interface SignUpRequest extends CreateUserRequest {}

export interface SignUpResponse {
  message: string;
  user: Omit<User, 'password'>;
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
}

// Case types
export interface Case {
  id: string;
  title: string;
  category: string;
  description: string;
  image1Url: string | null;
  image2Url: string | null;
  image3Url: string | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    comments: number;
    favorites: number;
  };
  favorites?: Array<{ id: string }>;
}

export interface CreateCaseRequest {
  title: string;
  category: string;
  description: string;
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
}

export interface UpdateCaseRequest {
  title?: string;
  category?: string;
  description?: string;
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
}

export interface CasesResponse {
  cases: Case[];
  pagination: PaginationResponse;
}

// Log entry types
export interface LogEntry {
  id: string;
  internId: string;
  procedureId: string;
  date: Date;
  count: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  procedure: {
    id: string;
    name: string;
    rotation: {
      id: string;
      name: string;
    };
  };
  verification?: {
    id: string;
    status: VerificationStatus;
    timestamp: Date | null;
    reason: string | null;
  };
}

export interface CreateLogRequest {
  procedureId: string;
  date: string;
  count: number;
  notes?: string;
}

export interface UpdateLogRequest {
  date?: string;
  count?: number;
  notes?: string;
}

export interface LogsResponse {
  logs: LogEntry[];
}

// Verification types
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Verification {
  id: string;
  logEntryId: string;
  verifierId: string | null;
  status: VerificationStatus;
  reason: string | null;
  timestamp: Date | null;
  logEntry: LogEntry;
  verifier?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface VerifyLogRequest {
  logEntryId: string;
  status: VerificationStatus;
  reason?: string;
}

export interface VerificationsResponse {
  verifications: Verification[];
}

// Progress types
export interface ProgressSummary {
  totalRequired: number;
  totalVerified: number;
  totalPending: number;
  completionPercentage: number;
}

export interface RotationProgress {
  rotationId: string;
  rotationName: string;
  required: number;
  verified: number;
  pending: number;
  completionPercentage: number;
  state: string;
}

export interface PendingVerification {
  id: string;
  logEntryId: string;
  procedureName: string;
  internName: string;
  date: Date;
  count: number;
  notes?: string;
  createdAt: Date;
}

export interface RecentActivity {
  id: string;
  type: 'LOG_CREATED' | 'LOG_VERIFIED' | 'LOG_REJECTED';
  description: string;
  timestamp: Date;
  internName: string;
  procedureName?: string;
}

export interface InternSummary {
  id: string;
  name: string;
  email: string;
  totalVerified: number;
  totalPending: number;
  completionPercentage: number;
}

export interface InternDashboard {
  summary: ProgressSummary;
  rotations: RotationProgress[];
  pendingVerifications: PendingVerification[];
  recentActivity: RecentActivity[];
  userInfo?: {
    name: string | null;
    email: string;
    createdAt: Date;
  };
}

export interface DashboardOverview {
  totalInterns: number;
  totalPendingVerifications: number;
  last7DaysActivity: number;
  interns: InternSummary[];
}

export interface ProgressResponse {
  summary?: ProgressSummary;
  rotations?: RotationProgress[];
  pendingVerifications?: PendingVerification[];
  recentActivity?: RecentActivity[];
  userInfo?: {
    name: string | null;
    email: string;
    createdAt: Date;
  };
  totalInterns?: number;
  last7DaysActivity?: number;
  interns?: InternSummary[];
}

// Procedure types
export interface Procedure {
  id: string;
  name: string;
  description: string | null;
  rotationId: string;
  createdAt: Date;
  updatedAt: Date;
  rotation: {
    id: string;
    name: string;
    state: string;
  };
}

export interface ProceduresResponse {
  procedures: Procedure[];
}

// Rotation types
export interface Rotation {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  state: string;
  createdAt: Date;
  updatedAt: Date;
  procedures: Procedure[];
  requirements: Requirement[];
}

export interface Requirement {
  id: string;
  rotationId: string;
  procedureId: string;
  minCount: number;
  trainingLevel: string | null;
  procedure: Procedure;
  rotation: Rotation;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  caseId: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  parent?: Comment;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Favorite types
export interface Favorite {
  id: string;
  userId: string;
  caseId: string;
  createdAt: Date;
  case: Case;
}

export interface CreateFavoriteRequest {
  caseId: string;
}

// Health check types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  responseTime: number;
  database: {
    status: 'healthy' | 'unhealthy';
    connected: boolean;
    error?: string;
  };
  memory: {
    heapUsed: number; // MB
    heapTotal: number; // MB
    external: number; // MB
    rss: number; // MB
  };
  cache: {
    totalMemory: number; // MB
    breakdown: Record<string, number>; // MB
  };
  metrics: {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
  };
  version: string;
  environment: string;
}

// Search and filter types
export interface SearchParams {
  search?: string;
  category?: string;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

// Export types
export interface LogExportRow {
  id: string;
  internName: string;
  procedureName: string;
  rotationName: string;
  date: string;
  count: number;
  notes?: string;
  status: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  reason?: string;
}

export interface ExportParams {
  userId: string;
  from?: Date;
  to?: Date;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
  details: ValidationError[];
  timestamp: string;
}

// Request context types
export interface RequestContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// Monitoring types
export interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

export interface MonitoringStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p95: number;
  p99: number;
}

// Cache types
export interface CacheStats {
  size: number;
  memoryUsage: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}
