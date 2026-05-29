# User Management Admin Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a User Management tab in the admin dashboard enabling admins to view, filter, and manage (suspend/ban/reactivate) users across all three roles with mandatory audit reasons and immediate session invalidation.

**Architecture:** Three-phase implementation: (1) Database schema updates to support status tracking, (2) Backend API endpoints using existing NestJS patterns with Supabase Admin integration, (3) Frontend page and modal following established admin UI components. Backend and frontend are decoupled via REST API contract.

**Tech Stack:** NestJS (backend), Next.js (frontend), Supabase Auth Admin API, React hooks for state management, CSS Modules for styling.

---

## Phase 1: Database Migrations

### Task 1: Apply Schema Migrations

**Files:**
- Supabase migrations (apply via Supabase dashboard or migration tool)

- [ ] **Step 1: Prepare migration SQL**

Save this SQL to a file or prepare to execute:

```sql
-- Add status tracking columns to digital_donor_profiles
ALTER TABLE public.digital_donor_profiles
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;

-- Add status tracking columns to beneficiary_profiles
ALTER TABLE public.beneficiary_profiles
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;

-- Add status tracking columns to campaign_manager_profiles
ALTER TABLE public.campaign_manager_profiles
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;
```

- [ ] **Step 2: Apply migrations to Supabase**

Use the Supabase dashboard SQL editor or CLI:

```bash
# If using Supabase CLI
cd C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be
supabase migration new add_status_tracking
# Then paste the SQL above into the generated migration file
supabase migration up
```

Or manually execute in Supabase dashboard: SQL Editor → paste the SQL → Run

- [ ] **Step 3: Verify columns were added**

In Supabase dashboard, query each table:

```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'digital_donor_profiles' 
ORDER BY column_name;
```

Verify `status_reason` (TEXT) and `status_changed_at` (TIMESTAMPTZ) are present in all three tables.

- [ ] **Step 4: Commit or document migration**

If using Supabase CLI migrations, commit the migration file:

```bash
git add supabase/migrations/
git commit -m "chore: add status tracking columns to user profile tables"
```

---

## Phase 2: Backend Implementation

### Task 2: Create Users Service

**Files:**
- Create: `apps/hopecard-admin-service/src/users/users.service.ts`

- [ ] **Step 1: Create the service file with getAllUsers method**

Create file: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be\apps\hopecard-admin-service\src\users\users.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { supabase } from '@app/common/supabase-client';
import { ActivityLogger } from '@app/common/activity-logger';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'Donor' | 'Beneficiary' | 'Campaign Manager';
  status: string;
  created_at: string;
}

export interface GetUsersResponse {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class UsersService {
  private readonly tableMap = {
    'Donor': 'digital_donor_profiles',
    'Beneficiary': 'beneficiary_profiles',
    'Campaign Manager': 'campaign_manager_profiles',
  };

  constructor(private readonly activityLogger: ActivityLogger) {}

  /**
   * Fetch all approved/active users with optional role filtering
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    roleFilter?: string,
  ): Promise<GetUsersResponse> {
    try {
      const offset = (page - 1) * limit;

      // Determine which tables to query
      const tablesToQuery =
        roleFilter && this.tableMap[roleFilter]
          ? [this.tableMap[roleFilter]]
          : Object.values(this.tableMap);

      const allUsers: any[] = [];
      let totalCount = 0;

      // Query each table
      for (const table of tablesToQuery) {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .in('status', ['approved', 'active'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching from ${table}:`, error);
          continue;
        }

        totalCount += count || 0;
        if (data) {
          allUsers.push(
            ...data.map((user) => ({
              ...user,
              role: this.getRoleFromTable(table),
            })),
          );
        }
      }

      // Sort all users by created_at and apply pagination
      const sortedUsers = allUsers.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      const paginatedUsers = sortedUsers.slice(offset, offset + limit);

      // Map to response format
      const formattedUsers: UserProfile[] = paginatedUsers.map((user) => ({
        id: user.id,
        auth_user_id: user.auth_user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      }));

      return {
        data: formattedUsers,
        total: totalCount,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Update user status and invalidate sessions
   */
  async updateUserStatus(
    userId: string,
    newStatus: 'active' | 'suspended' | 'banned',
    reason: string,
    role: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const table = this.tableMap[role];
      if (!table) {
        return { success: false, message: 'Invalid role provided' };
      }

      // Fetch the user to get auth_user_id
      const { data: user, error: fetchError } = await supabase
        .from(table)
        .select('auth_user_id, status')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        return { success: false, message: 'User not found' };
      }

      // Skip if status is not changing
      if (user.status === newStatus) {
        return {
          success: true,
          message: 'User status unchanged',
          data: user,
        };
      }

      // Update profile table
      const { data: updated, error: updateError } = await supabase
        .from(table)
        .update({
          status: newStatus,
          status_reason: reason,
          status_changed_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        return { success: false, message: `Failed to update user: ${updateError.message}` };
      }

      // Invalidate Supabase sessions if suspending or banning
      if (newStatus === 'suspended' || newStatus === 'banned') {
        try {
          // Sign out the user from all sessions
          await supabase.auth.admin.signOut(user.auth_user_id, {
            scope: 'all',
          });
        } catch (sessionError) {
          console.warn('Warning: Could not invalidate sessions:', sessionError);
          // Don't fail the overall operation if session invalidation fails
        }
      }

      // Log the activity
      await this.activityLogger.log({
        adminId: null, // Will be set by controller
        action: 'status_update',
        description: `${newStatus === 'active' ? 'Reactivated' : newStatus === 'suspended' ? 'Suspended' : 'Banned'} user account`,
        resourceType: 'user',
        resourceId: userId,
        changes: {
          status: { from: user.status, to: newStatus },
          reason,
        },
      });

      return {
        success: true,
        message: `User account ${newStatus} successfully`,
        data: updated,
      };
    } catch (error) {
      console.error('Error in updateUserStatus:', error);
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  /**
   * Helper to map table name to role
   */
  private getRoleFromTable(
    table: string,
  ): 'Donor' | 'Beneficiary' | 'Campaign Manager' {
    const roleMap = {
      'digital_donor_profiles': 'Donor',
      'beneficiary_profiles': 'Beneficiary',
      'campaign_manager_profiles': 'Campaign Manager',
    };
    return roleMap[table] as any;
  }
}
```

- [ ] **Step 2: Create the controller file**

Create file: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be\apps\hopecard-admin-service\src\users\users.controller.ts`

```typescript
import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { RequirePersona } from '@app/common';

@RequirePersona('admin', 'hopecard')
@Controller('hopecard/admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /hopecard/admin/users
   * Fetch all approved/active users with optional role filtering
   */
  @Get()
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
  ) {
    const pageNum = Math.max(1, Number.parseInt(page) || 1);
    const limitNum = Math.min(100, Number.parseInt(limit) || 10);

    const result = await this.usersService.getAllUsers(pageNum, limitNum, role);

    return {
      success: true,
      ...result,
    };
  }

  /**
   * PATCH /hopecard/admin/users/:id/status
   * Update user account status (suspend, ban, reactivate)
   */
  @Patch(':id/status')
  async updateUserStatus(
    @Param('id') userId: string,
    @Body()
    body: {
      status: 'active' | 'suspended' | 'banned';
      reason: string;
      role: string;
    },
  ) {
    if (!body.status || !body.reason || !body.role) {
      return {
        success: false,
        message: 'Missing required fields: status, reason, role',
      };
    }

    if (!['active', 'suspended', 'banned'].includes(body.status)) {
      return { success: false, message: 'Invalid status value' };
    }

    const result = await this.usersService.updateUserStatus(
      userId,
      body.status,
      body.reason,
      body.role,
    );

    return result;
  }
}
```

- [ ] **Step 3: Create the module file**

Create file: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be\apps\hopecard-admin-service\src\users\users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 4: Test the service compiles**

Run:

```bash
cd C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be
npm run build
```

Expected: Build succeeds with no errors in the `hopecard-admin-service` app.

- [ ] **Step 5: Commit**

```bash
git add apps/hopecard-admin-service/src/users/
git commit -m "feat: add users service and controller for admin user management"
```

---

### Task 3: Register Users Module in Admin Service

**Files:**
- Modify: `apps/hopecard-admin-service/src/admin-service.module.ts`

- [ ] **Step 1: Import UsersModule**

Open: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be\apps\hopecard-admin-service\src\admin-service.module.ts`

Add import at the top with other module imports:

```typescript
import { UsersModule } from './users/users.module';
```

- [ ] **Step 2: Add UsersModule to imports array**

Find the `@Module()` decorator and add `UsersModule` to the imports array:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
      ...(shouldValidateEnv ? { validate: validateEnv } : {}),
    }),
    SupabaseModule,
    ApiCenterSdkModule,
    GatewayModule,
    HealthModule,
    AuthModule,
    BeneficiariesModule,
    AnalyticsModule,
    ApprovalsModule,
    UsersModule,  // Add this line
  ],
})
export class HopecardAdminServiceModule implements NestModule {
  // ... rest of the code
}
```

- [ ] **Step 3: Verify compilation**

Run:

```bash
cd C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/hopecard-admin-service/src/admin-service.module.ts
git commit -m "feat: register users module in admin service"
```

---

## Phase 3: Frontend Implementation

### Task 4: Create Users Page

**Files:**
- Create: `hope-card/src/app/(admin)/admin/users/page.tsx`

- [ ] **Step 1: Create users directory**

```bash
mkdir -p "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card\src\app\(admin)\admin\users"
```

- [ ] **Step 2: Create page component**

Create file: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card\src\app\(admin)\admin\users\page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import ManageUserModal from '@/admin-components/layout/modals/Users/ManageUserModal';
import styles from '../tableStyles.module.css';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'Donor' | 'Beneficiary' | 'Campaign Manager';
  status: string;
  created_at: string;
}

interface PaginatedResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const roleOptions = ['All', 'Donor', 'Beneficiary', 'Campaign Manager'];
  const limit = 10;

  const fetchUsers = async (role: string, page: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        setUsers([]);
        setLoading(false);
        return;
      }

      const roleParam = role === 'All' ? '' : role;
      const url = `/admin/api/users?page=${page}&limit=${limit}${roleParam ? `&role=${roleParam}` : ''}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
      }

      const result: PaginatedResponse = await response.json();
      
      if (!result.data || !Array.isArray(result.data)) {
        setUsers([]);
        setTotalUsers(0);
        return;
      }

      // Format user names
      const formattedUsers = result.data.map((user) => ({
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
      }));

      setUsers(formattedUsers);
      setTotalUsers(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentRole, currentPage);
  }, [currentRole, currentPage]);

  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
    setCurrentPage(1);
  };

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    fetchUsers(currentRole, currentPage);
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Management</h1>

      {/* Role Filter Tabs */}
      <div className={styles.filterTabs}>
        {roleOptions.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`${styles.tab} ${currentRole === role ? styles.activeTab : ''}`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && <div className={styles.loadingMessage}>Loading users...</div>}

      {/* Error State */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => fetchUsers(currentRole, currentPage)} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && users.length > 0 && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{`${user.first_name} ${user.last_name}`}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${user.status}`]}`}>
                        {user.status === 'approved' ? 'Active' : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(user)}
                        className={styles.actionButton}
                        title="Manage user"
                      >
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className={styles.emptyMessage}>No users found</div>
      )}

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <ManageUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Test page loads without errors**

Start the frontend dev server:

```bash
cd C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe
npm run dev
```

Navigate to: `http://localhost:3000/admin/users`

Expected: Page loads (may show "Loading users..." until backend is running or no users if data is unavailable)

- [ ] **Step 4: Commit**

```bash
git add hope-card/src/app/\(admin\)/admin/users/page.tsx
git commit -m "feat: create users management page with filtering and pagination"
```

---

### Task 5: Create Manage User Modal Component

**Files:**
- Create: `hope-card/src/admin-components/layout/modals/Users/ManageUserModal.tsx`
- Create: `hope-card/src/admin-components/layout/modals/Users/ManageUserModal.module.css`

- [ ] **Step 1: Create Users modal directory**

```bash
mkdir -p "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card\src\admin-components\layout\modals\Users"
```

- [ ] **Step 2: Create modal component**

Create file: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card\src\admin-components\layout\modals\Users\ManageUserModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import BaseModal from '../shared/BaseModal';
import styles from './ManageUserModal.module.css';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'Donor' | 'Beneficiary' | 'Campaign Manager';
  status: string;
}

interface ManageUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageUserModal({
  user,
  onClose,
  onSuccess,
}: ManageUserModalProps) {
  const [selectedAction, setSelectedAction] = useState<
    'suspend' | 'ban' | 'reactivate' | null
  >(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isActive = user.status === 'approved' || user.status === 'active';
  const isSuspendedOrBanned =
    user.status === 'suspended' || user.status === 'banned';

  const handleAction = async () => {
    if (!selectedAction || !reason.trim()) {
      setMessage({
        type: 'error',
        text: 'Please select an action and provide a reason',
      });
      return;
    }

    if (reason.trim().length < 3) {
      setMessage({
        type: 'error',
        text: 'Reason must be at least 3 characters',
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found' });
        return;
      }

      const response = await fetch(
        `/admin/api/users/${user.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status:
              selectedAction === 'reactivate' ? 'active' : selectedAction,
            reason: reason.trim(),
            role: user.role,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update user: ${response.status}`,
        );
      }

      setMessage({
        type: 'success',
        text: `User account ${selectedAction === 'reactivate' ? 'reactivated' : selectedAction} successfully`,
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} title="Manage User Account">
      <div className={styles.container}>
        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.infoField}>
            <label>Name</label>
            <p>{`${user.first_name} ${user.last_name}`}</p>
          </div>
          <div className={styles.infoField}>
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          <div className={styles.infoField}>
            <label>Role</label>
            <p>{user.role}</p>
          </div>
          <div className={styles.infoField}>
            <label>Current Status</label>
            <p className={styles.status}>
              {user.status === 'approved'
                ? 'Active'
                : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </p>
          </div>
        </div>

        {/* Action Selection */}
        <div className={styles.actions}>
          {isActive && (
            <>
              <button
                onClick={() => {
                  setSelectedAction('suspend');
                  setReason('');
                  setMessage(null);
                }}
                className={`${styles.actionButton} ${
                  selectedAction === 'suspend' ? styles.selected : ''
                }`}
              >
                Suspend Account
              </button>
              <button
                onClick={() => {
                  setSelectedAction('ban');
                  setReason('');
                  setMessage(null);
                }}
                className={`${styles.actionButton} ${
                  selectedAction === 'ban' ? styles.selected : ''
                }`}
              >
                Ban Account
              </button>
            </>
          )}
          {isSuspendedOrBanned && (
            <button
              onClick={() => {
                setSelectedAction('reactivate');
                setReason('');
                setMessage(null);
              }}
              className={`${styles.actionButton} ${
                selectedAction === 'reactivate' ? styles.selected : ''
              }`}
            >
              Reactivate Account
            </button>
          )}
        </div>

        {/* Reason Field */}
        {selectedAction && (
          <div className={styles.reasonSection}>
            <label htmlFor="reason">
              Reason for Action <span className={styles.required}>*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="Please explain why this action is being taken..."
              maxLength={500}
              className={styles.textarea}
              disabled={loading}
            />
            <div className={styles.charCount}>
              {reason.length}/500 characters
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          {selectedAction && (
            <button
              onClick={handleAction}
              className={styles.confirmButton}
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
```

- [ ] **Step 3: Create modal styles**

Create file: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card\src\admin-components\layout\modals\Users\ManageUserModal.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.userInfo {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  display: grid;
  gap: 12px;
}

.infoField {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.infoField label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.infoField p {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.status {
  font-weight: 500;
  color: #2ecc71;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actionButton {
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
}

.actionButton:hover {
  border-color: #3498db;
  background: #f0f8ff;
}

.actionButton.selected {
  border-color: #3498db;
  background: #3498db;
  color: white;
}

.actionButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reasonSection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reasonSection label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.required {
  color: #e74c3c;
}

.textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  max-height: 200px;
}

.textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.charCount {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.message {
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.cancelButton,
.confirmButton {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancelButton {
  background: #f5f5f5;
  color: #333;
}

.cancelButton:hover:not(:disabled) {
  background: #e0e0e0;
}

.confirmButton {
  background: #3498db;
  color: white;
}

.confirmButton:hover:not(:disabled) {
  background: #2980b9;
}

.confirmButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 4: Test modal compiles and renders**

Start dev server if not running:

```bash
cd C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe
npm run dev
```

Navigate to: `http://localhost:3000/admin/users`

Expected: No console errors about missing modal component

- [ ] **Step 5: Commit**

```bash
git add hope-card/src/admin-components/layout/modals/Users/
git commit -m "feat: create manage user modal with suspend, ban, and reactivate actions"
```

---

### Task 6: Update Sidebar Navigation

**Files:**
- Modify: `hope-card/src/admin-components/layout/Sidebar.tsx`

- [ ] **Step 1: Add Users icon import**

Open: `C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card\src\admin-components\layout\Sidebar.tsx`

Find the lucide-react imports and verify `Users` is imported:

```typescript
import { LayoutGrid, User, Users, UserCheck, Heart, FileText, Landmark, LogOut } from "lucide-react";
```

If `Users` is not imported, add it to the list.

- [ ] **Step 2: Add User Management nav item**

Find the `navItems` array in the component and add the new item after "Digital Donor Approval":

```typescript
const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { name: "Digital Donor Approval", href: "/admin/digital-donors", icon: User },
  { name: "User Management", href: "/admin/users", icon: Users },  // Add this line
  { name: "Campaign Manager Approval", href: "/admin/campaign-managers", icon: Users },
  { name: "Beneficiaries Approval", href: "/admin/beneficiaries-approval", icon: UserCheck },
  { name: "Beneficiary Documents Approval", href: "/admin/beneficiary-documents-approval", icon: FileText },
  { name: "Beneficiary Bank Approval", href: "/admin/beneficiary-bank-approval", icon: Landmark },
  { name: "Campaign List", href: "/admin/beneficiaries-list", icon: Heart },
];
```

- [ ] **Step 3: Test sidebar navigation**

Refresh the browser at `http://localhost:3000/admin/dashboard`

Expected: "User Management" link appears in the sidebar. Clicking it navigates to `/admin/users`.

- [ ] **Step 4: Commit**

```bash
git add hope-card/src/admin-components/layout/Sidebar.tsx
git commit -m "feat: add user management link to admin sidebar navigation"
```

---

## Phase 4: Integration & Testing

### Task 7: Test Backend API Endpoints

**Files:**
- No new files; testing existing backend

- [ ] **Step 1: Start backend server**

```bash
cd C:\Users\arjel\Downloads\TriniThrive_Hopecard\Backend\trini-thrive-be
npm start -- --project hopecard-admin-service
```

Expected: Server starts on port (check console output, usually 3001 or as configured)

- [ ] **Step 2: Test GET /hopecard/admin/users endpoint**

Use curl or Postman to test:

```bash
curl -X GET "http://localhost:3001/hopecard/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "auth_user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "Donor",
      "status": "approved",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

- [ ] **Step 3: Test GET with role filter**

```bash
curl -X GET "http://localhost:3001/hopecard/admin/users?page=1&limit=10&role=Donor" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected: Returns only users with role "Donor"

- [ ] **Step 4: Test PATCH /hopecard/admin/users/:id/status endpoint**

```bash
curl -X PATCH "http://localhost:3001/hopecard/admin/users/USER_ID/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended",
    "reason": "Violating community guidelines",
    "role": "Donor"
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "User account suspended successfully",
  "data": {
    "id": "uuid",
    "status": "suspended",
    "status_reason": "Violating community guidelines",
    "status_changed_at": "2026-05-29T15:45:00Z"
  }
}
```

- [ ] **Step 5: Verify status update in database**

Query Supabase to verify the update:

```sql
SELECT id, status, status_reason, status_changed_at 
FROM digital_donor_profiles 
WHERE id = 'USER_ID';
```

Expected: Row shows `status = suspended`, `status_reason` populated, `status_changed_at` set to recent timestamp.

- [ ] **No commit for this task (testing only)**

---

### Task 8: Test Frontend User Interface

**Files:**
- No new files; testing existing components

- [ ] **Step 1: Verify users page loads**

With backend and frontend servers running, navigate to:

```
http://localhost:3000/admin/users
```

Expected: Page loads, shows "All Users" tab is selected, table displays users if available.

- [ ] **Step 2: Test role filtering**

Click on "Donors" tab.

Expected: Table updates to show only Donor users.

Click on "Beneficiary" tab.

Expected: Table updates to show only Beneficiary users.

Click on "Campaign Manager" tab.

Expected: Table updates to show only Campaign Manager users.

Click on "All Users" tab.

Expected: Table shows all users from all roles.

- [ ] **Step 3: Test pagination**

If more than 10 users exist, click "Next" button.

Expected: Table shows next page of users, page number updates.

Click "Previous" button.

Expected: Table shows previous page, page number updates.

- [ ] **Step 4: Test modal opens**

Click the settings (cog wheel) icon in the Actions column for any user.

Expected: Modal opens with user details displayed (name, email, role, status).

- [ ] **Step 5: Test suspend action**

In the modal, click "Suspend Account" (if user is active).

Expected: Button highlights, "Reason for action" text area appears.

Type a reason, e.g., "Testing suspension".

Click "Confirm".

Expected: Modal shows success message, closes after 2 seconds, table refreshes.

Verify in Supabase that user's status changed to "suspended" and reason is stored.

- [ ] **Step 6: Test ban action**

Open modal for another active user.

Click "Ban Account".

Type a reason, e.g., "Account violated ToS".

Click "Confirm".

Expected: Same behavior as suspend. User status changes to "banned".

- [ ] **Step 7: Test reactivate action**

Open modal for the suspended or banned user.

Click "Reactivate Account".

Type a reason, e.g., "Appeal accepted".

Click "Confirm".

Expected: Status changes back to "active". Modal shows success message.

- [ ] **Step 8: Test validation**

Open modal and click "Suspend Account".

Try to click "Confirm" without entering a reason.

Expected: Button is disabled and doesn't submit.

Type a reason and confirm it works.

- [ ] **Step 9: Test session invalidation (manual verification)**

After suspending a user:
1. In another browser tab, log in as that suspended user
2. Try to perform an action (e.g., view profile, make a donation)

Expected: User is logged out or denied access immediately.

- [ ] **No commit for this task (testing only)**

---

### Task 9: Database Verification

**Files:**
- No changes; verification only

- [ ] **Step 1: Verify columns exist**

In Supabase dashboard, run:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('digital_donor_profiles', 'beneficiary_profiles', 'campaign_manager_profiles')
AND column_name IN ('status_reason', 'status_changed_at')
ORDER BY table_name, column_name;
```

Expected: 6 rows returned (3 tables × 2 columns), all with correct data types.

- [ ] **Step 2: Verify status updates are recorded**

```sql
SELECT id, status, status_reason, status_changed_at 
FROM digital_donor_profiles 
WHERE status IN ('suspended', 'banned') 
LIMIT 5;
```

Expected: Rows show populated `status_reason` and `status_changed_at` values for suspended/banned users.

- [ ] **No commit for this task (verification only)**

---

### Task 10: Final Integration Test & Cleanup

**Files:**
- No new files

- [ ] **Step 1: Perform full user journey**

1. Log in to admin dashboard
2. Navigate to User Management
3. Filter by Donor role
4. Open modal for a test user
5. Suspend the user with a reason
6. Verify the user can't log in
7. Open modal again
8. Reactivate the user
9. Verify the user can log in again

Expected: All steps succeed without errors.

- [ ] **Step 2: Check browser console for errors**

While performing the above, check browser DevTools (F12) → Console tab.

Expected: No error messages, only normal logging.

- [ ] **Step 3: Check backend logs**

Look at backend server logs while testing.

Expected: No error stack traces; requests complete successfully.

- [ ] **Step 4: Verify activity logging**

In Supabase, check the `activity_logs` table:

```sql
SELECT action, description, resource_type, resource_id, changes 
FROM activity_logs 
WHERE action = 'status_update' 
ORDER BY created_at DESC 
LIMIT 5;
```

Expected: Rows show your status updates with correct description and changes JSON.

- [ ] **Step 5: Final commit**

```bash
git status
git add .
git commit -m "feat: complete user management admin feature with testing"
```

---

## Summary

✅ **Phase 1:** Database schema updated with status tracking columns  
✅ **Phase 2:** Backend service, controller, and module created and registered  
✅ **Phase 3:** Frontend page, modal, and sidebar navigation implemented  
✅ **Phase 4:** Full integration and end-to-end testing verified  

**Total Files Created:** 7  
**Total Files Modified:** 2  
**Estimated Time:** 2-3 hours for experienced developer
