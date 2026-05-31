"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewManagerModal from "@/admin-components/layout/modals/CampaignManagers/ReviewManagerModal";
import styles from "../tableStyles.module.css";

export default function CampaignManagers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  // Fetch pending approvals from backend
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('admin_token');
        
        if (!token) {
          setError('No authentication token found. Please log in.');
          setManagers([]);
          setLoading(false);
          return;
        }

        const response = await fetch('/admin/api/approvals/campaign-managers?page=1&limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.data || !Array.isArray(result.data)) {
          setManagers([]);
          setError(null);
          return;
        }

        // Map backend data to frontend format
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const storageBase = `${supabaseUrl}/storage/v1/object/public/camp-man-files`;

        const toStorageUrl = (path: string | null | undefined) =>
          path ? `${storageBase}/${path}` : null;

        const formattedData = result.data.map((m: any) => ({
          id: m.id,
          name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.full_name || 'N/A',
          org: m.organization || m.organization_name || m.company || 'N/A',
          email: m.email,
          date: m.created_at?.split('T')[0] || '',
          docsVerified: m.documents_verified || false,
          status: m.verification_status?.charAt(0).toUpperCase() + m.verification_status?.slice(1) || 'Pending',
          secRegistrationUrl: toStorageUrl(m.sec_registration),
          organizationalCertificateUrl: toStorageUrl(m.organizational_certificate),
        }));

        setManagers(formattedData);
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch pending approvals');
        setManagers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>Campaign Managers</h1>
          <p>Review and approve campaign manager applications</p>
        </header>
        <div className={styles.tableContainer}>
          <p>Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>Campaign Managers</h1>
          <p>Review and approve campaign manager applications</p>
        </header>
        <div className={styles.tableContainer}>
          <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  const filteredManagers = managers.filter(m => filter === "All" || m.status === filter);

  const handleReview = (manager: any) => {
    setSelectedManager(manager);
    setIsModalOpen(true);
  };

  const handleUpdateManager = (updatedManager: any) => {
    setManagers(managers.map(m => m.id === updatedManager.id ? updatedManager : m));
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Campaign Managers</h1>
        <p>Review and approve campaign manager applications</p>
      </header>

      <div className={styles.controlsContainer}>
        <div className={styles.tabsContainer}>
          {['All', 'Approved', 'Rejected', 'Pending'].map((status) => (
            <button
              key={status}
              className={`${styles.tab} ${filter === status ? styles.tabActive : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'All' ? 'All Registrations' : status}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Date Submitted</th>
              <th>Documents</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredManagers.map((manager) => (
              <tr key={manager.id}>
                <td className={styles.textDark}>{manager.name}</td>
                <td className={styles.textRed}>{manager.org}</td>
                <td className={styles.textRed}>{manager.email}</td>
                <td>{manager.date}</td>
                <td>{manager.docsVerified ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td><span className={`${styles.badge} ${styles['badge' + manager.status]}`}>{manager.status}</span></td>
                <td>
                  {manager.status === "Pending" && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleReview(manager)}
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The Modal */}
      <ReviewManagerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        managerData={selectedManager}
        onUpdate={handleUpdateManager}
      />
    </div>
  );
}