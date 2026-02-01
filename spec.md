# Team Remote Office Hours Scheduling App

## Overview
A scheduling application for managing team remote office hours with shared calendar functionality, claim queue system, and access control.

## Authentication & Access Control
- Internet Identity authentication required for editing functionality
- First-time users must provide name, select home time zone, and enter a passphrase to gain access
- Public calendar view available without authentication
- Admin privileges system with the app creator as default admin

## User Management
- Admin can view all users (active and revoked status)
- Admin can grant or revoke admin privileges to other users
- Admin can change the access passphrase
- Admin can revoke user access (users moved to revoked list cannot log in unless re-added)
- Backend stores user profiles with name, Internet Identity principal, admin status, access status, and home time zone

## Time Zone Support
- Users must select their home time zone during initial profile setup (e.g., "Pacific Time (UTC -8)")
- User settings panel allows updating home time zone selection
- All date/time displays use the current user's selected time zone
- Calendar view includes prominent time zone dropdown selector allowing users to view schedule times in any known time zone
- Backend stores user time zone preferences and handles time zone conversions

## Calendar & Shifts
- Google Calendar-style month-view calendar as main interface with true month-view grid layout displaying days of the month
- Clean white background with high-contrast accent colors (green or blue) for event blocks
- Top toolbar includes:
  - Month navigation arrows and "Today" button
  - Current month and year title (e.g., "January 2026")
  - Calendar view mode dropdown (default "Month")
- All scheduled office hours, including recurring events, appear as colored rectangular entries within each date cell
- Each event entry displays host name, start time, and notes if present
- Responsive design scales from desktop to mobile with rounded corners and subtle hover states
- Support for adding, editing, and deleting shifts (authenticated users only)
- Each shift contains:
  - Date and time (start and end)
  - Optional recurrence pattern (weekly, biweekly, monthly)
  - Notes field (can be specific to individual instances or apply to recurring series)
  - Meeting link (editable per instance)
  - Host name (can be blank for unclaimed shifts)
- Individual instances of recurring shifts can be edited independently
- Fixed recurrence rendering logic ensures all weekly, biweekly, and monthly repeating shifts correctly appear in calendar and claim queue views
- Backend stores shift data including recurrence patterns and instance-specific modifications

## Claim Queue
- List displayed below calendar showing unclaimed shifts within next 6 weeks
- Three-column format: date/time, "Name" input field, save button
- Users can claim shifts by entering their name and saving
- Calendar updates immediately when shifts are claimed
- Backend processes claim requests and updates shift host assignments

## Public vs Authenticated Views
- Public calendar displays all claimed office hour sessions as colored rectangular entries with host names and times
- Same month-view calendar layout for both public and authenticated users
- Login button in top-right corner for accessing Internet Identity
- Authenticated users see full calendar with editing capabilities (shift creation, editing, and claiming options visible)
- Admin panel accessible only to users with admin privileges

## Admin Panel
- User management functionality (view users, grant/revoke admin privileges, change passphrase)
- Shift summary panel showing claimed vs total shifts scheduled in next 6 weeks (e.g., "12 of 30 shifts claimed")
- Summary clearly labeled as covering 6-week window
- Breakdown by associate showing each user and number of claimed shifts during same 6-week period
- Backend calculates and provides shift statistics for admin dashboard

## Data Storage
- Backend stores user accounts, shift schedules, recurrence patterns, access control data, and time zone preferences
- Shift modifications and claims are persisted in real-time
- User authentication status and permissions maintained server-side
- Admin statistics calculated and cached for performance

## Visual Design
- Clean white background with high-contrast accent colors (green or blue) for event blocks
- Google Calendar-style month-view layout with rounded corners and subtle hover states
- Responsive design scaling from desktop to mobile
- Time zone selector positioned beneath or above the toolbar for cross-region clarity
- English language throughout application
