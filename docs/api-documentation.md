# API Documentation

## Overview

The Anesthesia Internship Tracker API provides endpoints for managing internship progress, case reviews, and user authentication. All API endpoints require authentication unless otherwise specified.

## Base URL

```
https://your-domain.com/api
```

## Authentication

The API uses JWT-based authentication with NextAuth.js. Include the session token in your requests.

### Headers

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
X-CSRF-Token: <csrf-token>
```

## Rate Limiting

- **General API**: 100 requests per minute
- **Authentication**: 5 requests per 15 minutes
- **Strict endpoints**: 10 requests per minute

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "requestId": "req_1234567890_abcdef123"
}
```

### Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Endpoints

### Authentication

#### POST /api/auth/signup

Create a new user account.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "idNumber": "ID123456",
  "password": "SecurePassword123!",
  "role": "INTERN"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "idNumber": "ID123456",
    "role": "INTERN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/auth/signin

Sign in with email and password.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "INTERN"
  }
}
```

### Cases

#### GET /api/cases

Get paginated list of cases with optional filtering.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search in title and description

**Response:**

```json
{
  "cases": [
    {
      "id": "case_123",
      "title": "Cardiac Arrest Management",
      "category": "Cardiac",
      "description": "Case description...",
      "image1Url": "https://example.com/image1.jpg",
      "image2Url": "https://example.com/image2.jpg",
      "image3Url": "https://example.com/image3.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "_count": {
        "comments": 5,
        "favorites": 12
      },
      "favorites": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "hasMore": true
  }
}
```

#### POST /api/cases

Create a new case.

**Request Body:**

```json
{
  "title": "New Case Title",
  "category": "Cardiac",
  "description": "Case description...",
  "image1Url": "https://example.com/image1.jpg",
  "image2Url": "https://example.com/image2.jpg",
  "image3Url": "https://example.com/image3.jpg"
}
```

**Response:**

```json
{
  "id": "case_123",
  "title": "New Case Title",
  "category": "Cardiac",
  "description": "Case description...",
  "image1Url": "https://example.com/image1.jpg",
  "image2Url": "https://example.com/image2.jpg",
  "image3Url": "https://example.com/image3.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "_count": {
    "comments": 0,
    "favorites": 0
  }
}
```

### Logs

#### GET /api/logs

Get user's log entries.

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `from` (string, optional): Start date (ISO 8601)
- `to` (string, optional): End date (ISO 8601)

**Response:**

```json
{
  "logs": [
    {
      "id": "log_123",
      "date": "2024-01-01T00:00:00.000Z",
      "count": 1,
      "notes": "Procedure notes...",
      "procedure": {
        "id": "proc_123",
        "name": "Intubation",
        "rotation": {
          "id": "rot_123",
          "name": "ICU Rotation"
        }
      },
      "verification": {
        "status": "PENDING",
        "timestamp": null
      }
    }
  ]
}
```

#### POST /api/logs

Create a new log entry.

**Request Body:**

```json
{
  "procedureId": "proc_123",
  "date": "2024-01-01T00:00:00.000Z",
  "count": 1,
  "notes": "Procedure notes..."
}
```

**Response:**

```json
{
  "id": "log_123"
}
```

### Progress

#### GET /api/progress

Get progress data for the current user or overview for tutors/admins.

**Query Parameters:**

- `userId` (string, optional): User ID (tutors/admins only)
- `tab` (string, optional): Data tab to retrieve

**Response (Intern):**

```json
{
  "summary": {
    "totalRequired": 100,
    "totalVerified": 75,
    "totalPending": 15,
    "completionPercentage": 75
  },
  "rotations": [
    {
      "rotationId": "rot_123",
      "rotationName": "ICU Rotation",
      "required": 50,
      "verified": 40,
      "pending": 5,
      "completionPercentage": 80,
      "state": "ACTIVE"
    }
  ],
  "pendingVerifications": [
    {
      "id": "ver_123",
      "logEntryId": "log_123",
      "procedureName": "Intubation",
      "internName": "John Doe",
      "date": "2024-01-01T00:00:00.000Z",
      "count": 1,
      "notes": "Procedure notes...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "recentActivity": [
    {
      "id": "act_123",
      "type": "LOG_CREATED",
      "description": "Logged 1 Intubation",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "internName": "You",
      "procedureName": "Intubation"
    }
  ]
}
```

### Verifications

#### GET /api/verifications

Get pending verifications (tutors/admins only).

**Response:**

```json
{
  "verifications": [
    {
      "id": "ver_123",
      "logEntryId": "log_123",
      "procedureName": "Intubation",
      "internName": "John Doe",
      "date": "2024-01-01T00:00:00.000Z",
      "count": 1,
      "notes": "Procedure notes...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/verifications

Verify or reject a log entry.

**Request Body:**

```json
{
  "logEntryId": "log_123",
  "status": "APPROVED",
  "reason": "Well documented procedure"
}
```

**Response:**

```json
{
  "message": "Verification updated successfully"
}
```

### Health

#### GET /api/health

Get system health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "responseTime": 45,
  "database": {
    "status": "healthy",
    "connected": true
  },
  "memory": {
    "heapUsed": 45,
    "heapTotal": 100,
    "external": 5,
    "rss": 120
  },
  "cache": {
    "totalMemory": 10,
    "breakdown": {
      "users": 2,
      "rotations": 3,
      "procedures": 5
    }
  },
  "metrics": {
    "totalRequests": 1000,
    "errorRate": 0.5,
    "averageResponseTime": 150
  }
}
```

## Data Types

### User Roles

- `INTERN`: Can create logs and view own progress
- `TUTOR`: Can verify logs and view all users' progress
- `ADMIN`: Full access to all features

### Verification Status

- `PENDING`: Awaiting verification
- `APPROVED`: Verified and approved
- `REJECTED`: Rejected with reason

### Rotation States

- `NOT_STARTED`: Rotation not yet started
- `ACTIVE`: Currently active rotation
- `FINISHED`: Completed rotation

## Security

### CSRF Protection

All state-changing requests require a CSRF token in the `X-CSRF-Token` header.

### Input Validation

All inputs are validated and sanitized:

- String inputs are trimmed and length-limited
- Email addresses are normalized
- HTML content is sanitized
- SQL injection prevention

### Rate Limiting

Rate limits are enforced per IP address and user session.

## Examples

### Creating a Log Entry

```javascript
const response = await fetch('/api/logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    procedureId: 'proc_123',
    date: new Date().toISOString(),
    count: 1,
    notes: 'Successful intubation on patient with difficult airway',
  }),
});

const result = await response.json();
```

### Getting Progress Data

```javascript
const response = await fetch('/api/progress?tab=overview');
const progress = await response.json();

console.log(`Completion: ${progress.summary.completionPercentage}%`);
```

### Verifying a Log Entry

```javascript
const response = await fetch('/api/verifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify({
    logEntryId: 'log_123',
    status: 'APPROVED',
    reason: 'Well documented procedure with appropriate technique',
  }),
});
```
