"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, FileText, Image, Building2 } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import styles from "./ReviewManagerModal.module.css";

interface ReviewManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  managerData: any;
  onUpdate?: (manager: any) => void;
}

export default function ReviewManagerModal({ isOpen, onClose, managerData, onUpdate }: ReviewManagerModalProps) {
  const [secVerified, setSecVerified] = useState(false);
  const [certVerified, setCertVerified] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!managerData) return null;

  const handleApprove = async () => {
    if (!secVerified || !certVerified) {
      alert("Please verify both SEC Registration and Organizational Certificate before approving");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const adminInfoStr = localStorage.getItem('admin_info') || '{}';
      const adminInfo = JSON.parse(adminInfoStr);
      const adminId = adminInfo.id || 'admin';

      const response = await fetch(`/admin/api/approvals/campaign-managers/${managerData.id}/approve`, {
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

      const updatedManager = { ...managerData, docsVerified: true, status: "Approved" };
      if (onUpdate) onUpdate(updatedManager);
      alert(`Successfully approved: ${managerData.name}`);
      onClose();
    } catch (error) {
      console.error('Error approving campaign manager:', error);
      alert('Error approving campaign manager. Please try again.');
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

      const response = await fetch(`/admin/api/approvals/campaign-managers/${managerData.id}/reject`, {
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

      const updatedManager = { ...managerData, docsVerified: false, status: "Rejected" };
      if (onUpdate) onUpdate(updatedManager);
      alert(`Successfully rejected: ${managerData.name}\nReason: ${rejectionReason}`);
      onClose();
    } catch (error) {
      console.error('Error rejecting campaign manager:', error);
      alert('Error rejecting campaign manager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Campaign Manager"
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Organization Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Organization</span>
              <span className={styles.infoValue}>{managerData.org}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Contact Email</span>
              <span className={styles.infoValue}>{managerData.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Submitted</span>
              <span className={styles.infoValue}>{managerData.date}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Legal Documents</h3>
          
          <div className={styles.field}>
            <label className={styles.label}>SEC Registration</label>
            <div className={styles.documentPreview}>
              {managerData.secRegistrationUrl ? (
                managerData.secRegistrationUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <div className={styles.previewImageWrapper}>
                    <img src={managerData.secRegistrationUrl} alt="SEC Registration" className={styles.previewImage} />
                  </div>
                ) : (
                  <a href={managerData.secRegistrationUrl} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                    <FileText size={32} />
                    <span>View SEC Document</span>
                  </a>
                )
              ) : (
                <div className={styles.previewBox}>
                  <FileText size={32} />
                  <span>No SEC Document provided</span>
                </div>
              )}
            </div>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={secVerified}
                onChange={(e) => setSecVerified(e.target.checked)}
              />
              <span>I have verified this SEC registration is valid</span>
              <div className={styles.statusIcon}>
                {secVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
              </div>
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Organizational Certificate</label>
            <div className={styles.documentPreview}>
              {managerData.organizationalCertificateUrl ? (
                managerData.organizationalCertificateUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <div className={styles.previewImageWrapper}>
                    <img src={managerData.organizationalCertificateUrl} alt="Organizational Certificate" className={styles.previewImage} />
                  </div>
                ) : (
                  <a href={managerData.organizationalCertificateUrl} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                    <Building2 size={32} />
                    <span>View Certificate</span>
                  </a>
                )
              ) : (
                <div className={styles.previewBox}>
                  <Building2 size={32} />
                  <span>No Certificate provided</span>
                </div>
              )}
            </div>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={certVerified}
                onChange={(e) => setCertVerified(e.target.checked)}
              />
              <span>I have verified this organizational certificate is valid</span>
              <div className={styles.statusIcon}>
                {certVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
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
              <button className={styles.approveBtn} onClick={handleApprove} disabled={loading}>
                {loading ? "Processing..." : "Approve"}
              </button>
              <button className={styles.rejectBtn} onClick={() => setShowRejectForm(true)} disabled={loading}>
                Reject
              </button>
            </>
          ) : (
            <>
              <button className={styles.rejectBtn} onClick={handleReject} disabled={loading}>
                {loading ? "Processing..." : "Confirm Reject"}
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowRejectForm(false)} disabled={loading}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
}