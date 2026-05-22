"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewBeneficiaryBankModal from "@/admin-components/layout/modals/BeneficiaryBankApproval/ReviewBeneficiaryBankModal";
import styles from "../tableStyles.module.css";

export default function BeneficiaryBankApproval() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('No authentication token found. Please log in.');
        setApprovals([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/admin/api/approvals/beneficiaries/bank?page=1&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('--- FRONTEND BANK DEBUG ---', result);
      
      if (!result.data || !Array.isArray(result.data)) {
        setApprovals([]);
        return;
      }

      // Map backend data to frontend format
      const formattedData = result.data.map((item: any) => ({
        id: item.id,
        beneficiaryId: item.beneficiary_profile_id,
        name: item.beneficiary_name || 'N/A',
        email: item.beneficiary_email || 'N/A',
        date: item.created_at?.split('T')[0] || 'N/A',
        bank: item.status === 'approved',
        accountName: item.account_holder_name || 'N/A',
        bankName: item.bank_name || 'N/A',
        accountNumber: item.account_number || 'N/A',
        status: item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Pending',
      }));

      console.log('Formatted Data:', formattedData);
      setApprovals(formattedData);
    } catch (err) {
      console.error('Error fetching bank approvals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const filteredApprovals = approvals.filter(a => filter === "All" || a.status === filter);

  const handleReview = (item: any) => {
    setSelectedBeneficiary(item);
    setIsModalOpen(true);
  };

  const handleUpdateBeneficiary = (updatedBeneficiary: any) => {
    // Refresh the list after update
    fetchApprovals();
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>Beneficiary Bank Approval</h1>
          <p>Review and approve beneficiary bank account details</p>
        </header>
        <div className={styles.tableContainer}>
          <p>Loading bank approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>Beneficiary Bank Approval</h1>
          <p>Review and approve beneficiary bank account details</p>
        </header>
        <div className={styles.tableContainer}>
          <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Beneficiary Bank Approval</h1>
        <p>Review and approve beneficiary bank account details</p>
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
              <th>Email</th>
              <th>Date Submitted</th>
              <th>Bank Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovals.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No bank approvals found.</td>
              </tr>
            ) : (
              filteredApprovals.map((item) => (
                <tr key={item.id}>
                  <td className={styles.textDark}>{item.name}</td>
                  <td className={styles.textRed}>{item.email}</td>
                  <td>{item.date}</td>
                  <td>{item.bank ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                  <td><span className={`${styles.badge} ${styles[`badge${item.status}`]}`}>{item.status}</span></td>
                  <td>
                    {item.status === "Pending" && (
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleReview(item)}
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReviewBeneficiaryBankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        beneficiaryData={selectedBeneficiary}
        onUpdate={handleUpdateBeneficiary}
      />
    </div>
  );
}
