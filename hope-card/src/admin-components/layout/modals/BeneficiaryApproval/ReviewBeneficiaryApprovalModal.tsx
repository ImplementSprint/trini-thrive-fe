"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Image } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import styles from "./ReviewBeneficiaryApprovalModal.module.css";

function getSupabaseImageUrl(filePath: string): string {
  if (!filePath) return "";
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hycsbfugiboutvgbvueg.supabase.co";
  const bucketName = "beneficiary-ids";
  
  if (filePath.startsWith("http")) return filePath;
  
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

interface ReviewBeneficiaryApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryData: any;
  onUpdate?: (beneficiary: any) => void;
  mode?: 'application' | 'documents';
}

export default function ReviewBeneficiaryApprovalModal({ 
  isOpen, 
  onClose, 
  beneficiaryData,
  onUpdate,
  mode = 'application'
}: ReviewBeneficiaryApprovalModalProps) {
  const [idVerified, setIdVerified] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!beneficiaryData) return null;

  const idImageUrl = getSupabaseImageUrl(beneficiaryData?.idVerificationKey);

  const handleApprove = async () => {
    if (!idVerified) {
      alert("Please verify the Identity Document before approving");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const adminInfoStr = localStorage.getItem('admin_info') || '{}';
      const adminInfo = JSON.parse(adminInfoStr);
      const adminId = adminInfo.id || 'admin';

      const endpoint = mode === 'documents' 
        ? `/admin/api/approvals/beneficiaries/${beneficiaryData.beneficiaryId || beneficiaryData.id}/documents/approve`
        : `/admin/api/approvals/beneficiaries/${beneficiaryData.id}/approve`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to approve: ${error.message || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      const updatedBeneficiary = { ...beneficiaryData, status: "Approved" };
      if (onUpdate) onUpdate(updatedBeneficiary);
      alert(`Successfully approved: ${beneficiaryData.name}`);
      onClose();
    } catch (error) {
      console.error('Error approving beneficiary:', error);
      alert('Error approving beneficiary. Please try again.');
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
      const token = localStorage.getItem('admin_token');
      const adminInfoStr = localStorage.getItem('admin_info') || '{}';
      const adminInfo = JSON.parse(adminInfoStr);
      const adminId = adminInfo.id || 'admin';

      const endpoint = mode === 'documents' 
        ? `/admin/api/approvals/beneficiaries/${beneficiaryData.beneficiaryId || beneficiaryData.id}/documents/reject`
        : `/admin/api/approvals/beneficiaries/${beneficiaryData.id}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId, reason: rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to reject: ${error.message || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      const updatedBeneficiary = { ...beneficiaryData, status: "Rejected" };
      if (onUpdate) onUpdate(updatedBeneficiary);
      alert(`Successfully rejected: ${beneficiaryData.name}\nReason: ${rejectionReason}`);
      onClose();
    } catch (error) {
      console.error('Error rejecting beneficiary:', error);
      alert('Error rejecting beneficiary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Beneficiary Application"
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Application Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Campaign</span>
              <span className={styles.infoValue}>{beneficiaryData.campaign}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{beneficiaryData.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Submitted</span>
              <span className={styles.infoValue}>{beneficiaryData.date}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Identity Verification</h3>
          
          <div className={styles.field}>
            <label className={styles.label}>Government-issued ID</label>
            <div className={styles.documentPreview}>
              <div className={styles.previewBox}>
                {idImageUrl ? (
                  <div className={styles.imageScrollContainer}>
                    <img 
                      src={idImageUrl} 
                      alt="ID Document"
                      className={styles.documentImage}
                      onError={(e) => {
                        console.error('Failed to load image:', idImageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className={styles.placeholderContent}>
                    <Image size={32} />
                    <span>ID Document Preview</span>
                  </div>
                )}
              </div>
            </div>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={idVerified}
                onChange={(e) => setIdVerified(e.target.checked)}
              />
              <span>I have verified this identity document is valid</span>
              <div className={styles.statusIcon}>
                {idVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
              </div>
            </label>
          </div>
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