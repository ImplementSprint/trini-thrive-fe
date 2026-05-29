# User Management Admin Feature - Design Specification

**Date:** 2026-05-29  
**Feature:** Admin User Management Tab  
**Status:** Design Approved

---

## 1. Overview

This feature enables HopeCard admins to view all approved/active users across three roles (Donor, Beneficiary, Campaign Manager), filter by role, and manage account status (suspend, ban, reactivate) with mandatory reason tracking.

---

## 2. Requirements

### Functional Requirements

**User Discovery:**
- Display all approved/active users from all three profile tables
- Filter by role: All Users, Donors, Beneficiary, Campaign Managers
- Sort by date joined (newest first)
- Paginated table view with standard sorting

**User Actions:**
- **Suspend Account** → Temporarily disable access, invalidate sessions immediately
- **Ban Account** → Disable access (reactivatable), invalidate sessions immediately
- **Reactivate Account** → Restore access from suspended or banned state
- **Reason Tracking** → All actions require a mandatory reason field (audit trail)

**Data Displayed:**
- Name (first_name + last_name)
- Email
- Role (Donor, Beneficiary, or Campaign Manager)
- Date Joined (created_at)
- Current Status
- Action button (cog wheel icon)

### Non-Functional Requirements

- Supabase Auth sessions must be invalidated immediately upon suspension/ban
- All admin actions logged via existing `ActivityLogger`
- Follows existing admin UI patterns and modal components
- No breaking changes to existing user data or status values
- Backward compatible: existing "approved" users treated as "active"

---

## 3. Database Schema Changes

### Migration 1: Add Status Tracking Columns

Add to `digital_donor_profiles`, `beneficiary_profiles`, and `campaign_manager_profiles`:

```sql
ALTER TABLE digital_donor_profiles
ADD COLUMN status_reason TEXT,
ADD COLUMN status_changed_at TIMESTAMPTZ;

ALTER TABLE beneficiary_profiles
ADD COLUMN status_reason TEXT,
ADD COLUMN status_changed_at TIMESTAMPTZ;

ALTER TABLE campaign_manager_profiles
ADD COLUMN status_reason TEXT,
ADD COLUMN status_changed_at TIMESTAMPTZ;
```

### Status Values

The `status` column accepts these values (existing + new):

| Value | Meaning | User Can Login? |
|-------|---------|-----------------|
| `pending` | Awaiting admin approval | No |
| `approved` | Admin-approved (legacy, treated as active) | Yes |
| `active` | Admin-approved, account enabled | Yes |
| `suspended` | Temporarily disabled by admin | No |
| `banned` | Permanently disabled by admin (reactivatable) | No |
| `rejected` | Rejected during approval | No |

**Code Behavior:** `approved` and `active` are treated equivalently in business logic.

---

## 4. Backend Implementation

### Module Structure

**Location:** `apps/hopecard-admin-service/src/users/`

**Files:**
- `users.module.ts` — Module definition with controller + service
- `users.controller.ts` — Route handlers with `@RequirePersona('admin', 'hopecard')`
- `users.service.ts` — Business logic for fetching and updating users

### API Endpoints

#### GET /hopecard/admin/users

Fetch all approved/active users with optional filtering.

**Query Parameters:**
```
page: number (default: 1)
limit: number (default: 10, max: 100)
role?: "Donor" | "Beneficiary" | "Campaign Manager" (optional, filters by role)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "auth_user_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Donor",
      "status": "active",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

#### PATCH /hopecard/admin/users/:id/status

Update a user's account status and invalidate their sessions.

**Request Body:**
```json
{
  "status": "suspended" | "banned" | "active",
  "reason": "User reported for violating ToS",
  "role": "Donor" | "Beneficiary" | "Campaign Manager"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User account suspended successfully",
  "data": {
    "id": "uuid",
    "status": "suspended",
    "status_reason": "User reported for violating ToS",
    "status_changed_at": "2026-05-29T15:45:00Z"
  }
}
```

**Side Effects:**
- Updates `status`, `status_reason`, `status_changed_at` in the appropriate profile table
- Calls Supabase Admin API to invalidate all active sessions for the user
- Logs action via `ActivityLogger` with resource_type="user", action="status_update"

### Service Logic

**`UsersService`:**

1. **`getAllUsers(page, limit, roleFilter?)`**
   - Query three profile tables separately using `select()` and filter for status IN ('approved', 'active')
   - If roleFilter provided, query only the matching table
   - Union results (or sequential queries depending on filter)
   - Map database row to DTO with name = `${first_name} ${last_name}`
   - Sort by `created_at DESC`, apply pagination
   - Return paginated results with total count

2. **`updateUserStatus(userId, newStatus, reason, role)`**
   - Validate role matches one of three valid values
   - Query the appropriate profile table to get the user record
   - Verify user exists and status is different from current
   - Update profile table with `status`, `status_reason`, `status_changed_at`
   - Call Supabase Admin API: `supabase.auth.admin.updateUserById(auth_user_id, { banned: true })` for suspend/ban
   - Call Supabase Admin API to invalidate sessions: `supabase.auth.admin.signOut(auth_user_id, scope: 'all')`
   - Log activity: action="status_update", description="Suspended|Banned|Reactivated", changes={status, reason}
   - Return updated user record

**Error Handling:**
- If user not found: return 404
- If status update fails: return 400 with error message
- If session invalidation fails: log warning but return 200 (status was updated)
- If `auth_user_id` missing: log warning, skip session invalidation

### Module Registration

Update `admin-service.module.ts`:
```typescript
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ... existing imports
    UsersModule,
  ],
})
export class HopecardAdminServiceModule implements NestModule {
  // ...
}
```

---

## 5. Frontend Implementation

### New Pages and Components

**Location:** `hope-card/src/app/(admin)/admin/users/`

#### Users Page (`page.tsx`)

**Features:**
- Role filter tabs: "All Users" | "Donors" | "Beneficiary" | "Campaign Manager"
- Data table with columns: Name, Email, Role, Date Joined, Status, Actions
- Cog wheel button in Actions column opens `ManageUserModal`
- Pagination controls at bottom
- Loading state while fetching
- Error state with retry button

**Data Flow:**
1. On mount, fetch users from `GET /hopecard/admin/users` with default role filter
2. When filter tab clicked, refetch with role query parameter
3. When user clicks cog wheel, open modal with selected user data
4. On modal action completion, refetch user list

**UI State:**
- `users`: User[] — Current page of users
- `loading`: boolean — Fetch in progress
- `error`: string | null — Error message
- `selectedUser`: User | null — User opened in modal
- `isModalOpen`: boolean — Modal visibility
- `currentRole`: string — Currently selected role filter
- `currentPage`: number — Pagination state

#### Manage User Modal (`ManageUserModal.tsx`)

**Header:**
- Display user name, email, role, and current status

**Body:**
- Show status-appropriate action buttons:
  - If status is "active" or "approved": Show "Suspend Account" and "Ban Account" buttons
  - If status is "suspended" or "banned": Show "Reactivate Account" button
- Reason field (textarea):
  - Label: "Reason for action"
  - Placeholder: "e.g., Violated community guidelines, suspicious activity detected"
  - Required
  - Max 500 characters
- Action buttons:
  - "Confirm" → Call PATCH endpoint with selected action + reason
  - "Cancel" → Close modal without changes

**States:**
- Loading while API request in progress
- Disabled state for form while loading
- Success toast notification on completion
- Error toast notification on failure
- Refetch parent page data on success

---

## 6. Navigation Updates

**File:** `hope-card/src/admin-components/layout/Sidebar.tsx`

Add to `navItems` array:
```typescript
{ name: "User Management", href: "/admin/users", icon: Users }
```

(Reuse existing `Users` icon from lucide-react, or use `Shield` / `UserCog` if preferred)

---

## 7. Data Flow Diagram

```
┌─────────────────────┐
│  Admin User View    │
│  (Filter by Role)   │
└──────────┬──────────┘
           │ GET /hopecard/admin/users?role=Donor
           ▼
┌─────────────────────────────────────────┐
│  Backend UsersService.getAllUsers()     │
│  - Query digital_donor_profiles         │
│  - Filter for status IN (approved,      │
│    active)                              │
│  - Map & paginate results               │
└──────────┬──────────────────────────────┘
           │ Returns paginated user list
           ▼
┌─────────────────────┐
│  Table renders      │
│  with data          │
└─────────┬───────────┘
          │ User clicks cog wheel
          ▼
┌─────────────────────┐
│ Modal Opens with    │
│ user details        │
└─────────┬───────────┘
          │ Admin selects action + reason
          ▼
┌──────────────────────────────────────┐
│ PATCH /hopecard/admin/users/:id/     │
│        status                        │
│ { status, reason, role }             │
└──────────┬───────────────────────────┘
           │
           ├─→ Update profile table status
           │
           ├─→ Call Supabase Admin API
           │   to invalidate sessions
           │
           └─→ Log activity
           │
           ▼
┌─────────────────────┐
│ Modal shows         │
│ success/error       │
│ Refetch user list   │
└─────────────────────┘
```

---

## 8. Integration Points

**Existing Systems:**

1. **Supabase Client** (`@app/common/supabase-client`)
   - Uses existing `supabase` instance with service role key
   - Calls `supabase.auth.admin.*` methods for session invalidation

2. **Activity Logger** (`@app/common/activity-logger`)
   - Logs all status changes with resource_type="user"
   - Captures admin_id, timestamp, changes (old/new status)

3. **Authentication** (`@app/common` decorators)
   - `@RequirePersona('admin', 'hopecard')` guards all endpoints
   - Uses existing token validation

4. **Frontend Token** (`localStorage.admin_token`)
   - Reuse existing auth token from admin login
   - Pass in Authorization header for API calls

---

## 9. Testing Strategy

### Backend Tests

- **Unit Tests:** `users.service.spec.ts`
  - Test `getAllUsers()` with various role filters
  - Test `updateUserStatus()` with valid/invalid transitions
  - Test error cases (user not found, invalid role)

- **Integration Tests:** `users.controller.spec.ts`
  - Test endpoint responses with mock data
  - Verify status codes and response format
  - Test pagination behavior

- **Session Invalidation:** Manual verification
  - Suspend/ban a test user
  - Verify user cannot log in
  - Verify existing browser sessions are cleared

### Frontend Tests

- **Component Tests:** `page.tsx`, `ManageUserModal.tsx`
  - Test filter tab switching
  - Test modal open/close behavior
  - Test form validation (reason required)
  - Test API call on action

- **Manual Verification:**
  - Navigate to `/admin/users`
  - Filter by each role
  - Open modal and test all three actions
  - Verify table updates after action
  - Check database for status_reason and status_changed_at values
  - Attempt to log in as suspended/banned user

---

## 10. Assumptions & Constraints

**Assumptions:**
- All three profile tables (`digital_donor_profiles`, `beneficiary_profiles`, `campaign_manager_profiles`) are writable by the admin service
- Supabase Admin API credentials (`SUPABASE_SERVICE_ROLE_KEY`) are configured in `.env`
- Users filtered by "approved" or "active" status are the ones displayed
- Pagination defaults to 10 items per page
- Modal reason field is required (form won't submit without it)

**Constraints:**
- Session invalidation is async; there may be a brief window where user can perform actions before session fully expires
- "Reason" field is stored in `status_reason` column (single text field, not versioned history)
- If Supabase Auth and profile tables get out of sync, manual intervention may be needed

---

## 11. Future Enhancements (Out of Scope)

- User activity/login history dashboard
- Bulk user actions (suspend/ban multiple at once)
- Status change audit log with versioned history
- Automated suspension rules (e.g., X failed logins)
- Email notifications to suspended/banned users

---

## 12. Success Criteria

✅ Admin can view all approved/active users across roles  
✅ Filtering by role works correctly and reduces result set  
✅ Pagination displays correct page of results  
✅ Modal opens with correct user data when cog wheel clicked  
✅ Suspend/Ban actions update status and invalidate sessions  
✅ Reactivate action restores access for suspended/banned users  
✅ Reason field is required and stored in database  
✅ All actions logged via ActivityLogger  
✅ User cannot log in immediately after suspension/ban  
✅ Table refreshes after modal action completes  
✅ No errors in browser console or backend logs

---

## Appendix: Column Addition SQL

```sql
-- Exact migrations to apply
ALTER TABLE public.digital_donor_profiles
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;

ALTER TABLE public.beneficiary_profiles
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;

ALTER TABLE public.campaign_manager_profiles
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;
```
