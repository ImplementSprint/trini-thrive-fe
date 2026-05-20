"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import styles from "./ChangePasswordModal.module.css";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL;
      const token = localStorage.getItem('admin_token');
      
      // Get user email from JWT token
      let userEmail = "";
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          userEmail = decoded.email || "";
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }

      if (!userEmail) {
        setError("Session expired - please log in again");
        setLoading(false);
        return;
      }

      const response = await fetch(`/admin/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to change password");
        setLoading(false);
        return;
      }

      // Verify the new password works by attempting login
      try {
        const loginTest = await fetch(`/admin/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, password: newPassword }),
        });
        
        if (loginTest.ok) {
          console.log("✅ New password verified");
        }
      } catch (e) {
        console.warn("Could not verify password");
      }

      setSuccess("Password changed successfully!");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError("An error occurred while changing password");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2>Change Password</h2>
            <p>Update your account password</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              padding: "0.75rem",
              color: "#9b2c2c",
              fontSize: "0.9rem",
              marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: "6px",
              padding: "0.75rem",
              color: "#166534",
              fontSize: "0.9rem",
              marginBottom: "1rem"
            }}>
              {success}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                required
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowCurrent(!showCurrent)}
                disabled={loading}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password (min 8 characters)"
                required
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowNew(!showNew)}
                disabled={loading}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                required
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={loading}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
