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

      setUsers(result.data);
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
      {selectedUser && (
        <ManageUserModal
          isOpen={isModalOpen}
          user={selectedUser}
          onClose={handleCloseModal}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
