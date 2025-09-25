# T9 Progress Dashboard - Manual Test Checklist

## Overview

This document provides a comprehensive manual testing checklist for the T9 Progress Dashboard MVP implementation. The dashboard includes intern progress tracking, CSV export functionality, and role-based access controls.

## Test Environment Setup

### Prerequisites

- [ ] Database is seeded with test data (rotations, procedures, requirements, users, logs)
- [ ] At least 2-3 interns with different progress levels
- [ ] At least 1 tutor and 1 admin user
- [ ] Some log entries with different verification statuses (PENDING, APPROVED, REJECTED)
- [ ] Multiple rotations with different requirements

### Test Users

- [ ] **Intern User**: Can only view their own progress
- [ ] **Tutor User**: Can view overview and any intern's progress
- [ ] **Admin User**: Can view overview and any intern's progress

## Test Cases

### 1. Intern Dashboard (`/dashboard`)

#### 1.1 Overall Progress Section

- [ ] **Progress Bar**: Displays correct percentage based on verified vs required
- [ ] **Total Counts**: Shows accurate total required, verified, and pending counts
- [ ] **Visual Design**: Progress bar is blue and properly styled
- [ ] **Responsive**: Works on mobile and desktop

#### 1.2 Rotation Progress Cards

- [ ] **Card Display**: Each rotation shows as a separate card
- [ ] **Rotation Names**: Correctly displays rotation names
- [ ] **Progress Bars**: Each card shows individual progress bar
- [ ] **Counts**: Required, verified, and pending counts are accurate
- [ ] **Completion Percentage**: Calculated correctly per rotation
- [ ] **Grid Layout**: Cards are properly arranged in responsive grid
- [ ] **Empty State**: Handles case when no rotations exist

#### 1.3 Pending Verifications

- [ ] **Latest 5**: Shows only the 5 most recent pending verifications
- [ ] **Procedure Names**: Displays correct procedure names
- [ ] **Counts**: Shows correct count of procedures
- [ ] **Dates**: Displays dates in Asia/Jerusalem timezone
- [ ] **Notes**: Shows notes if available
- [ ] **Status Badge**: Shows "Pending" status badge
- [ ] **Empty State**: Shows "No pending verifications" when none exist

#### 1.4 Recent Activity

- [ ] **Latest 10**: Shows only the 10 most recent activities
- [ ] **Activity Types**: Displays LOG_CREATED, LOG_VERIFIED, LOG_REJECTED
- [ ] **Icons**: Correct icons for each activity type
- [ ] **Colors**: Appropriate colors for each activity type
- [ ] **Timestamps**: Displays in Asia/Jerusalem timezone
- [ ] **Procedure Names**: Shows procedure names when relevant
- [ ] **Empty State**: Shows "No recent activity" when none exists

#### 1.5 Export CSV Button

- [ ] **Button Visibility**: Export button is visible and properly styled
- [ ] **Click Action**: Clicking button triggers download
- [ ] **Loading State**: Shows loading spinner during export
- [ ] **File Download**: Downloads CSV file with correct filename
- [ ] **Filename Format**: `logs_{userId}_{date}.csv`
- [ ] **CSV Content**: Contains all required columns and data
- [ ] **Error Handling**: Shows error message if export fails

### 2. Overview Dashboard (`/dashboard?tab=overview`)

#### 2.1 Access Control

- [ ] **TUTOR Access**: Tutor can access overview tab
- [ ] **ADMIN Access**: Admin can access overview tab
- [ ] **INTERN Denied**: Intern gets 403 error when trying to access overview
- [ ] **Unauthenticated**: Unauthenticated users get 401 error

#### 2.2 Summary Cards

- [ ] **Total Interns**: Shows correct count of intern users
- [ ] **Pending Verifications**: Shows total pending verifications across all users
- [ ] **Last 7 Days Activity**: Shows log entries created in last 7 days
- [ ] **Card Design**: Cards are properly styled with icons
- [ ] **Responsive**: Cards work on mobile and desktop

#### 2.3 Interns Table

- [ ] **Table Headers**: All required columns are present
- [ ] **Intern Data**: Shows name, email, verified count, pending count
- [ ] **Progress Bars**: Visual progress indicators for each intern
- [ ] **Completion Percentage**: Calculated correctly for each intern
- [ ] **View Details Links**: Links to individual intern dashboards
- [ ] **Empty State**: Handles case when no interns exist
- [ ] **Responsive**: Table is scrollable on mobile

### 3. API Endpoints

#### 3.1 GET /api/progress

- [ ] **Authentication Required**: Returns 401 without valid session
- [ ] **Intern Progress**: Returns correct data for intern user
- [ ] **Overview Data**: Returns overview data for tutor/admin
- [ ] **Access Control**: Interns can only access their own data
- [ ] **Tutor/Admin Access**: Can access any user's data
- [ ] **Query Parameters**: Handles userId and tab parameters correctly
- [ ] **Error Handling**: Returns appropriate error messages
- [ ] **Performance**: Response time is reasonable (< 2 seconds)

#### 3.2 GET /api/export/logs

- [ ] **Authentication Required**: Returns 401 without valid session
- [ ] **CSV Export**: Returns CSV file with correct headers
- [ ] **Data Accuracy**: All log data is included and accurate
- [ ] **Date Filtering**: Handles from/to date parameters
- [ ] **Filename**: Generates appropriate filename
- [ ] **Content-Type**: Returns correct text/csv content type
- [ ] **Access Control**: Users can only export their own data (except tutors/admins)
- [ ] **Error Handling**: Handles database errors gracefully

#### 3.3 GET /api/session

- [ ] **Authentication Required**: Returns 401 without valid session
- [ ] **User Data**: Returns correct user information
- [ ] **Role Information**: Includes user role in response

### 4. Security Tests

#### 4.1 Role-Based Access Control

- [ ] **Intern Restrictions**: Interns cannot access other users' data
- [ ] **Tutor Permissions**: Tutors can access any user's data
- [ ] **Admin Permissions**: Admins can access any user's data
- [ ] **Overview Access**: Only tutors and admins can access overview
- [ ] **Export Permissions**: Users can only export their own data (except tutors/admins)

#### 4.2 Data Validation

- [ ] **Input Validation**: Invalid query parameters return 400 errors
- [ ] **SQL Injection**: No SQL injection vulnerabilities
- [ ] **XSS Protection**: No cross-site scripting vulnerabilities
- [ ] **CSRF Protection**: CSRF tokens are properly handled

### 5. Mobile Responsiveness

#### 5.1 Mobile Layout

- [ ] **Progress Cards**: Cards stack properly on mobile
- [ ] **Tables**: Tables are horizontally scrollable
- [ ] **Buttons**: Export button is properly sized and accessible
- [ ] **Text**: All text is readable on mobile screens
- [ ] **Touch Targets**: All interactive elements are touch-friendly

#### 5.2 Tablet Layout

- [ ] **Grid Layout**: Cards arrange properly on tablet screens
- [ ] **Navigation**: Navigation works smoothly
- [ ] **Forms**: All forms are usable on tablet

### 6. Performance Tests

#### 6.1 Load Times

- [ ] **Initial Load**: Dashboard loads within 3 seconds
- [ ] **API Responses**: API calls complete within 2 seconds
- [ ] **Export Generation**: CSV export completes within 5 seconds
- [ ] **Large Datasets**: Handles large numbers of logs efficiently

#### 6.2 Memory Usage

- [ ] **No Memory Leaks**: Dashboard doesn't consume excessive memory
- [ ] **Cleanup**: Components properly clean up on unmount

### 7. Error Handling

#### 7.1 Network Errors

- [ ] **API Failures**: Shows appropriate error messages
- [ ] **Retry Logic**: Provides retry options where appropriate
- [ ] **Offline Handling**: Gracefully handles offline scenarios

#### 7.2 Data Errors

- [ ] **Missing Data**: Handles missing or corrupted data gracefully
- [ ] **Empty States**: Shows appropriate empty state messages
- [ ] **Invalid Data**: Handles invalid data without crashing

### 8. Browser Compatibility

#### 8.1 Modern Browsers

- [ ] **Chrome**: All features work correctly
- [ ] **Firefox**: All features work correctly
- [ ] **Safari**: All features work correctly
- [ ] **Edge**: All features work correctly

#### 8.2 Mobile Browsers

- [ ] **Chrome Mobile**: All features work correctly
- [ ] **Safari Mobile**: All features work correctly
- [ ] **Samsung Internet**: All features work correctly

## Test Data Scenarios

### Scenario 1: New Intern

- [ ] Intern with no logs shows 0% progress
- [ ] All rotation cards show 0 verified, 0 pending
- [ ] No pending verifications
- [ ] No recent activity
- [ ] Export returns empty CSV

### Scenario 2: Active Intern

- [ ] Intern with mixed progress shows accurate percentages
- [ ] Some rotations complete, others in progress
- [ ] Pending verifications are displayed
- [ ] Recent activity shows various log types
- [ ] Export includes all log entries

### Scenario 3: Completed Intern

- [ ] Intern with 100% progress shows correctly
- [ ] All rotation cards show 100% completion
- [ ] No pending verifications
- [ ] Recent activity shows verification activities
- [ ] Export includes all historical data

## Sign-off Checklist

- [ ] All test cases pass
- [ ] No critical bugs found
- [ ] Performance meets requirements
- [ ] Security requirements satisfied
- [ ] Mobile responsiveness confirmed
- [ ] Browser compatibility verified
- [ ] Documentation is complete
- [ ] Code review completed
- [ ] Ready for production deployment

## Notes

- All timestamps should be displayed in Asia/Jerusalem timezone
- CSV exports should use proper escaping for special characters
- Progress calculations should be rounded to nearest whole number
- Empty states should be user-friendly and informative
- Error messages should be clear and actionable
