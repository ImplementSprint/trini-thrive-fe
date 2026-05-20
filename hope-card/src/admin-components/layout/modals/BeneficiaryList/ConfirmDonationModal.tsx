"use client";

import { X } from "lucide-react";
import { useState } from "react";
import styles from "./ConfirmDonationModal.module.css";

interface ConfirmDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Added onConfirm prop
  data: any;
}

export default function ConfirmDonationModal({ isOpen, onClose, onConfirm, data }: ConfirmDonationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const handleConfirmDonation = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      const adminId = localStorage.getItem('admin_id') || 'admin';
      
      // Extract numeric amount from formatted string (e.g., "₱50,000" -> 50000)
      const amountStr = data.amount.replace(/[^0-9]/g, '');
      const amount = parseFloat(amountStr) || 0;

      const response = await fetch(`/admin/api/approvals/beneficiaries/${data.id}/donate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId,
          amount,
          campaign: data.campaign,
          notes: `Donation sent to ${data.name}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to process donation');
      }

      const result = await response.json();
      console.log('✅ Donation successful:', result);
      onConfirm(); // Call parent callback to show success modal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('❌ Donation error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* ... existing header and close button ... */}
        <button className={styles.closeBtn} onClick={onClose} disabled={isProcessing}>
          <X size={20} />
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>Confirm Donation</h2>
          
          <p className={styles.message}>
            Send <span className={styles.amount}>{data.amount}</span> to <strong>{data.name}</strong>?
          </p>

          <div className={styles.infoBox}>
            <p><strong>Campaign:</strong> {data.campaign}</p>
            <p className={styles.subtext}>
              This action will transfer the allocated funds to the beneficiary's bank account.
            </p>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <div className={styles.actions}>
            <button 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              className={styles.confirmBtn} 
              onClick={handleConfirmDonation}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}