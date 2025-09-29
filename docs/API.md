# API Documentation

## Authentication Endpoints

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "INTERN"
}
```

### POST /api/auth/signin
Sign in a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Progress Endpoints

### GET /api/progress
Get progress data for a user.

**Query Parameters:**
- `userId` (optional): User ID
- `rotationId` (optional): Rotation ID

## Log Endpoints

### POST /api/logs
Create a new log entry.

**Request Body:**
```json
{
  "procedureId": "procedure-id",
  "count": 1,
  "date": "2024-01-15",
  "notes": "Successful procedure"
}
```

## Monitoring Endpoints

### GET /api/monitoring/health
Get system health status.

### GET /api/monitoring/metrics
Get system metrics.

**Query Parameters:**
- `type` (optional): Metric type (performance, errors, analytics)

### GET /api/monitoring/errors
Get error statistics.

**Query Parameters:**
- `severity` (optional): Error severity
- `resolved` (optional): Filter by resolved status
- `limit` (optional): Number of errors to return
