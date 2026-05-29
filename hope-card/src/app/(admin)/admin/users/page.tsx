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

  const getStatusBadgeClass = (status: string) => {
    if (status === 'approved' || status === 'active') return styles.badgeApproved;
    if (status === 'suspended') return styles.badgePending;
    if (status === 'banned') return styles.badgeRejected;
    return styles.badgePending;
  };

  const getStatusDisplayText = (status: string) => {
    if (status === 'approved') return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>User Management</h1>
        <p>View and manage user accounts across all roles</p>
      </header>

      {/* Role Filter Tabs */}
      <div className={styles.controlsContainer}>
        <div className={styles.tabsContainer}>
          {roleOptions.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`${styles.tab} ${currentRole === role ? styles.tabActive : ''}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.tableContainer}>
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.tableContainer}>
          <div style={{ padding: '2rem', color: '#991b1b', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <strong>Error:</strong> {error}
            <button
              onClick={() => fetchUsers(currentRole, currentPage)}
              style={{
                marginLeft: '1rem',
                padding: '0.4rem 1rem',
                backgroundColor: '#9b2c2c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && users.length > 0 && (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
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
                    <td className={styles.textDark}>{`${user.first_name} ${user.last_name}`}</td>
                    <td className={styles.textRed}>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(user.status)}`}>
                        {getStatusDisplayText(user.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(user)}
                        className={styles.actionBtn}
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
          <div className={styles.controlsContainer}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={styles.actionBtn}
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              Previous
            </button>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={styles.actionBtn}
              style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className={styles.tableContainer}>
          <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No users found</p>
        </div>
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
