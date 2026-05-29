"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Image } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import styles from "./ReviewDonorModal.module.css";

interface ReviewDonorModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly donorData: any;
  readonly onUpdate?: (donor: any) => void;
}

function getSupabaseImageUrl(filePath: string): string {
  if (!filePath) return "";
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const bucketName = "donor-ids";
  
  // If filePath is already a full URL, return it
  if (filePath.startsWith("http")) {
    return filePath;
  }
  
  // Construct the public URL
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

export default function ReviewDonorModal({ isOpen, onClose, donorData, onUpdate }: ReviewDonorModalProps) {
  const [idVerified, setIdVerified] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!donorData) return null;

  const idImageUrl = getSupabaseImageUrl(donorData?.idVerificationKey);

  const handleApprove = async () => {
    if (!idVerified) {
      alert("Please verify Identity Document before approving");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const adminInfoStr = localStorage.getItem('admin_info') || '{}';
      const adminInfo = JSON.parse(adminInfoStr);
      const adminId = adminInfo.id || 'admin';

      const response = await fetch(`/admin/api/approvals/digital-donors/${donorData.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: adminId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to approve: ${error.message || "Unknown error"}`);
        return;
      }

      await response.json();
      const updatedDonor = { ...donorData, idVerified, status: "Approved" };
      if (onUpdate) onUpdate(updatedDonor);
      alert(`Approved: ${donorData.name}`);
      onClose();
    } catch (error) {
      console.error("Error approving donor:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to approve"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const adminInfoStr = localStorage.getItem('admin_info') || '{}';
      const adminInfo = JSON.parse(adminInfoStr);
      const adminId = adminInfo.id || 'admin';

      const response = await fetch(`/admin/api/approvals/digital-donors/${donorData.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: adminId,
          reason: rejectionReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to reject: ${error.message || "Unknown error"}`);
        return;
      }

      await response.json();
      const updatedDonor = { ...donorData, idVerified, status: "Rejected" };
      if (onUpdate) onUpdate(updatedDonor);
      alert(`Rejected: ${donorData.name}\nReason: ${rejectionReason}`);
      setShowRejectForm(false);
      onClose();
    } catch (error) {
      console.error("Error rejecting donor:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to reject"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Digital Donor"
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Donor Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.field}>
              <label htmlFor="donor-name" className={styles.label}>Name</label>
              <p id="donor-name" className={styles.value}>{donorData?.name || 'N/A'}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="donor-email" className={styles.label}>Email</label>
              <p id="donor-email" className={styles.value}>{donorData?.email || 'N/A'}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="donor-municipality" className={styles.label}>Municipality</label>
              <p id="donor-municipality" className={styles.value}>{donorData?.municipality || 'N/A'}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="donor-province" className={styles.label}>Province</label>
              <p id="donor-province" className={styles.value}>{donorData?.province || 'N/A'}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="donor-date" className={styles.label}>Date</label>
              <p id="donor-date" className={styles.value}>{donorData?.date || 'N/A'}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="donor-status" className={styles.label}>Status</label>
              <p id="donor-status" className={styles.value}>{donorData?.status || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Uploaded Documents</h3>
          
          <div className={styles.field}>
            <label className={styles.label}>Identity Document</label>
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
            <label htmlFor="id-verify-checkbox" className={styles.checkbox}>
              <input
                id="id-verify-checkbox"
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
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Approve"}
              </button>
              <button 
                className={styles.rejectBtn} 
                onClick={() => setShowRejectForm(true)}
                disabled={isLoading}
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button 
                className={styles.rejectBtn} 
                onClick={handleReject}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm Reject"}
              </button>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setShowRejectForm(false)}
                disabled={isLoading}
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