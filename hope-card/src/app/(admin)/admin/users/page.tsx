"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import styles from "../tableStyles.module.css";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "Donor" | "Beneficiary" | "Campaign Manager";
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
  const [currentRole, setCurrentRole] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const roleOptions = ["All", "Donor", "Beneficiary", "Campaign Manager"];
  const limit = 10;

  const fetchUsers = async (role: string, page: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("admin_token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setUsers([]);
        setLoading(false);
        return;
      }

      const roleParam = role === "All" ? "" : role;
      const url = `/admin/api/users?page=${page}&limit=${limit}${roleParam ? `&role=${roleParam}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch users: ${response.status}`
        );
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
      setError(err instanceof Error ? err.message : "Failed to fetch users");
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

  const handleRetry = () => {
    fetchUsers(currentRole, currentPage);
  };

  const totalPages = Math.ceil(totalUsers / limit);

  const getStatusBadgeClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === "pending") return "badgePending";
    if (statusLower === "approved" || statusLower === "active") return "badgeApproved";
    if (statusLower === "rejected") return "badgeRejected";
    return "badgePending";
  };

  const formatStatusText = (status: string): string => {
    if (status.toLowerCase() === "approved") return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>User Management</h1>
          <p>Manage and monitor all system users</p>
        </header>
        <div className={styles.tableContainer}>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>User Management</h1>
          <p>Manage and monitor all system users</p>
        </header>
        <div className={styles.tableContainer}>
          <div
            style={{
              padding: "20px",
              color: "#ef4444",
              backgroundColor: "#fee2e2",
              borderRadius: "8px",
            }}
          >
            <strong>Error:</strong> {error}
            <button
              onClick={handleRetry}
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                backgroundColor: "#9b2c2c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>User Management</h1>
        <p>Manage and monitor all system users</p>
      </header>

      <div className={styles.controlsContainer}>
        <div className={styles.tabsContainer}>
          {roleOptions.map((role) => (
            <button
              key={role}
              className={`${styles.tab} ${currentRole === role ? styles.tabActive : ""}`}
              onClick={() => handleRoleChange(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ padding: "20px" }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ padding: "20px" }}>No users found</p>
        ) : (
          <>
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
                    <td className={styles.textDark}>
                      {`${user.first_name} ${user.last_name}`}
                    </td>
                    <td className={styles.textRed}>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          styles[getStatusBadgeClass(user.status)]
                        }`}
                      >
                        {formatStatusText(user.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        title="Manage user"
                        onClick={() => {
                          // TODO: Implement modal or navigate to user details
                          console.log("Manage user:", user.id);
                        }}
                      >
                        <Settings size={18} style={{ display: "inline" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  padding: "20px",
                  borderTop: "1px solid #eaeaea",
                }}
              >
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className={styles.actionBtn}
                  style={{
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className={styles.actionBtn}
                  style={{
                    opacity: currentPage >= totalPages ? 0.5 : 1,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
