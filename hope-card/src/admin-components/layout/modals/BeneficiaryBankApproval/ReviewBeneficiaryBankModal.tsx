"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import styles from "./ReviewBeneficiaryBankModal.module.css";

interface ReviewBeneficiaryBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryData: any;
  onUpdate?: (beneficiary: any) => void;
}

export default function ReviewBeneficiaryBankModal({
  isOpen,
  onClose,
  beneficiaryData,
  onUpdate,
}: ReviewBeneficiaryBankModalProps) {
  const [bankVerified, setBankVerified] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!beneficiaryData) return null;

  const handleApprove = async () => {
    if (!bankVerified) {
      alert("Please verify the bank account details before approving");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const adminInfoStr = localStorage.getItem("admin_info") || "{}";
      const adminInfo = JSON.parse(adminInfoStr);
      const adminId = adminInfo.id || "admin";

      const response = await fetch(
        `/admin/api/approvals/beneficiaries/${beneficiaryData.beneficiaryId || beneficiaryData.id}/bank/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to approve: ${error.message || "Unknown error"}`);
        return;
      }

      const updatedBeneficiary = { ...beneficiaryData, status: "Approved" };
      if (onUpdate) onUpdate(updatedBeneficiary);
      alert(`Successfully approved bank details for: ${beneficiaryData.name}`);
      onClose();
    } catch (error) {
      console.error("Error approving bank details:", error);
      alert("Error approving bank details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const adminInfoStr = localStorage.getItem("admin_info") || "{}";
      const adminInfo = JSON.parse(adminInfoStr);
      const adminId = adminInfo.id || "admin";

      const response = await fetch(
        `/admin/api/approvals/beneficiaries/${beneficiaryData.beneficiaryId || beneficiaryData.id}/bank/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId, reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to reject: ${error.message || "Unknown error"}`);
        return;
      }

      const updatedBeneficiary = { ...beneficiaryData, status: "Rejected" };
      if (onUpdate) onUpdate(updatedBeneficiary);
      alert(
        `Successfully rejected bank details for: ${beneficiaryData.name}\nReason: ${rejectionReason}`
      );
      onClose();
    } catch (error) {
      console.error("Error rejecting bank details:", error);
      alert("Error rejecting bank details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Bank Account Details"
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Beneficiary Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{beneficiaryData.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{beneficiaryData.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date Submitted</span>
              <span className={styles.infoValue}>{beneficiaryData.date}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Bank Account Details</h3>
          <div className={styles.bankDetails}>
            <div className={styles.bankField}>
              <label className={styles.label}>Account Name</label>
              <div className={styles.bankValue}>
                {beneficiaryData.accountName || beneficiaryData.name}
              </div>
            </div>
            <div className={styles.bankField}>
              <label className={styles.label}>Bank</label>
              <div className={styles.bankValue}>
                {beneficiaryData.bankName || "N/A"}
              </div>
            </div>
            <div className={styles.bankField}>
              <label className={styles.label}>Account Number</label>
              <div className={styles.bankValue}>
                {beneficiaryData.accountNumber || "N/A"}
              </div>
            </div>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={bankVerified}
              onChange={(e) => setBankVerified(e.target.checked)}
            />
            <span>I have verified these bank account details are valid</span>
            <div className={styles.statusIcon}>
              {bankVerified ? (
                <CheckCircle2 size={18} color="#22c55e" />
              ) : (
                <XCircle size={18} color="#ef4444" />
              )}
            </div>
          </label>
        </div>

        {showRejectForm && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Rejection Reason</h3>
            <textarea
              className={styles.textarea}
              placeholder="Provide reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}

        <div className={styles.actions}>
          {!showRejectForm ? (
            <>
              <button
                className={styles.approveBtn}
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? "Processing..." : "Approve"}
              </button>
              <button
                className={styles.rejectBtn}
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.rejectBtn}
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Reject"}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowRejectForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
