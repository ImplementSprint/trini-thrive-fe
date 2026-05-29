"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewBeneficiaryApprovalModal from "@/admin-components/layout/modals/BeneficiaryApproval/ReviewBeneficiaryApprovalModal";
import styles from "../tableStyles.module.css";

export default function BeneficiariesApproval() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  // Fetch pending approvals from backend
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/admin/api/approvals/beneficiaries?page=1&limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch pending approvals');

        const result = await response.json();
        // Map backend data to frontend format
        const formattedData = result.data.map((b: any) => ({
          id: b.id,
          name: `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'N/A',
          campaign: b.campaign || 'General Aid',
          email: b.email || 'N/A',
          date: b.created_at?.split('T')[0] || '',
          docs: !!b.documents_submitted,
          bank: !!b.bank_details_submitted,
          idVerificationKey: b.id_verification_key,
          bankName: b.bank_name,
          accountNumber: b.account_number,
          accountName: b.account_name,
          status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Pending',
        }));

        setApprovals(formattedData);
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        // Fallback to empty list
        setApprovals([]);
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
          <h1>Beneficiaries Approval</h1>
          <p>Review and approve beneficiary applications</p>
        </header>
        <div className={styles.tableContainer}>
          <p>Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  const filteredApprovals = approvals.filter(a => filter === "All" || a.status === filter);

  const handleReview = (item: any) => {
    setSelectedBeneficiary(item);
    setIsModalOpen(true);
  };

  const handleUpdateBeneficiary = (updatedBeneficiary: any) => {
    setApprovals(approvals.map(a => a.id === updatedBeneficiary.id ? updatedBeneficiary : a));
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Beneficiaries Approval</h1>
        <p>Review and approve beneficiary applications</p>
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
              <th>Campaign</th>
              <th>Email</th>
              <th>Date Submitted</th>
              <th>Documents</th>
              <th>Bank Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovals.map((item) => (
              <tr key={item.id}>
                <td className={styles.textDark}>{item.name}</td>
                <td className={styles.textRed}>{item.campaign}</td>
                <td className={styles.textRed}>{item.email}</td>
                <td>{item.date}</td>
                <td>{item.docs ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td>{item.bank ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td><span className={`${styles.badge} ${styles['badge' + item.status]}`}>{item.status}</span></td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Render the renamed Modal */}
      <ReviewBeneficiaryApprovalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        beneficiaryData={selectedBeneficiary}
        onUpdate={handleUpdateBeneficiary}
      />
    </div>
  );
}