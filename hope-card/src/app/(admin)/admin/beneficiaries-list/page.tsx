"use client";

import { useState, useEffect } from "react";
// Import both modals
import ConfirmDonationModal from "@/admin-components/layout/modals/BeneficiaryList/ConfirmDonationModal";
import DonationSuccessModal from "@/admin-components/layout/modals/BeneficiaryList/DonationSuccessModal";
import styles from "../tableStyles.module.css";

export default function BeneficiariesList() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Separate states for visibility
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Fetch beneficiaries from backend
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/admin/api/beneficiaries?page=1&limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch beneficiaries');
        
        const result = await response.json();
        // Map backend data to frontend format
        const formattedData = result.data.map((b: any) => ({
          id: b.id,
          campaignManager: b.campaign_manager_name || 'N/A',
          campaign: b.campaign || 'General Aid',
          name: `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'N/A',
          amount: typeof b.allocated_amount === 'number' ? `₱${b.allocated_amount.toLocaleString()}` : (b.allocated_amount ? `₱${b.allocated_amount}` : '₱0'),
          status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : (b.verification_status === 'verified' ? 'Approved' : 'Pending'),
        }));
        
        setList(formattedData);
      } catch (error) {
        console.error('Error fetching beneficiaries:', error);
        // Fallback to mock data
        setList([
          { id: 1, campaignManager: "John Smith", campaign: "Medical Assistance", name: "Maria Santos", amount: "₱50,000", status: "Approved" },
          { id: 2, campaignManager: "Jane Doe", campaign: "Education Fund", name: "Juan dela Cruz", amount: "₱25,000", status: "Approved" },
          { id: 3, campaignManager: "Bob Johnson", campaign: "Disaster Relief", name: "Pedro Garcia", amount: "₱75,000", status: "Approved" },
          { id: 4, campaignManager: "Alice Brown", campaign: "Food Security", name: "Sofia Martinez", amount: "₱30,000", status: "Sent" },
          { id: 5, campaignManager: "Charlie Wilson", campaign: "Housing Support", name: "Ana Reyes", amount: "₱100,000", status: "Approved" },
          { id: 6, campaignManager: "John Smith", campaign: "Medical Assistance", name: "Carlos Mendoza", amount: "₱45,000", status: "Pending" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, []);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <h1>Campaign List</h1>
          <p>Manage campaigns and send donations to beneficiaries</p>
        </header>
        <div className={styles.tableContainer}>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };

  const handleDonationSuccess = () => {
    setIsConfirmOpen(false);
    if (selectedItem) {
      setList(prev => prev.map(item => item.id === selectedItem.id ? { ...item, status: 'Sent' } : item));
    }
    setIsSuccessOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Campaign List</h1>
        <p>Manage campaigns and send donations to beneficiaries</p>
      </header>
      
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Campaign Manager</th>
              <th>Campaign Name</th>
              <th>Beneficiary</th>
              <th>Amount Allocated</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td className={styles.textDark}>{item.campaignManager || 'N/A'}</td>
                <td className={styles.textRed}>{item.campaign}</td>
                <td className={styles.textDark}>{item.name}</td>
                <td className={styles.textDark}>{item.amount}</td>
                <td><span className={`${styles.badge} ${styles[`badge${item.status}`]}`}>{item.status}</span></td>
                <td>
                  {item.status === "Sent" ? (
                    <span className={styles.actionTextCompleted}>Sent</span>
                  ) : item.status === "Pending" ? (
                    <span className={styles.actionTextDisabled}>Approval Pending</span>
                  ) : (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleOpenModal(item)}
                    >
                      Send Donation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Custom Confirmation Modal */}
      <ConfirmDonationModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDonationSuccess} // Pass the success handler
        data={selectedItem}
      />

      {/* MODAL 2: New Success Modal */}
      <DonationSuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
        data={selectedItem}
      />
    </div>
  );
}