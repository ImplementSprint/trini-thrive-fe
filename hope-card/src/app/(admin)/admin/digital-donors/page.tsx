"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewDonorModal from "@/admin-components/layout/modals/DigitalDonors/ReviewDonorModal";
import styles from "../tableStyles.module.css";

export default function DigitalDonors() {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
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
          setDonors([]);
          setLoading(false);
          return;
        }

        const response = await fetch('/admin/api/approvals/digital-donors?page=1&limit=100', {
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
          setDonors([]);
          setError(null);
          return;
        }

        // Map backend data to frontend format
        const formattedData = result.data.map((d: any) => ({
          id: d.id,
          name: d.name || `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.full_name || 'N/A',
          email: d.email,
          date: d.created_at?.split('T')[0] || '',
          idVerified: !!d.id_verification_key || d.id_verified || false,
          idVerificationKey: d.id_verification_key,
          status: d.status?.charAt(0).toUpperCase() + d.status?.slice(1) || 'Pending',
          age: d.age,
          gender: d.gender,
          company: d.company,
          phone: d.phone,
          address: d.address,
          image: d.image || "/HopeCard%20Logo.png"
        }));

        setDonors(formattedData);
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch pending approvals');
        setDonors([]);
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
          <h1>Digital Donors</h1>
          <p>Review and approve digital donor registrations</p>
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
          <h1>Digital Donors</h1>
          <p>Review and approve digital donor registrations</p>
        </header>
        <div className={styles.tableContainer}>
          <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  const filteredDonors = donors.filter(d => filter === "All" || d.status === filter);

  const handleReview = (donor: any) => {
    setSelectedDonor(donor);
    setIsModalOpen(true);
  };

  const handleUpdateDonor = (updatedDonor: any) => {
    setDonors(donors.map(d => d.id === updatedDonor.id ? updatedDonor : d));
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Digital Donors</h1>
        <p>Review and approve digital donor registrations</p>
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
              <th>Identity Verified</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.map((donor) => (
              <tr key={donor.id}>
                <td className={styles.textDark}>{donor.name}</td>
                <td className={styles.textRed}>{donor.email}</td>
                <td>{donor.date}</td>
                <td>{donor.idVerified ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td><span className={`${styles.badge} ${styles[`badge${donor.status}`]}`}>{donor.status}</span></td>
                <td>
                  {donor.status === "Pending" && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleReview(donor)} // Trigger opening
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

      {/* 3. The Modal Component */}
      <ReviewDonorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        donorData={selectedDonor}
        onUpdate={handleUpdateDonor}
      />
    </div>
  );
}