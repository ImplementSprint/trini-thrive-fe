"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import styles from "@/app/(admin)/admin/login/login.module.css";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate passwords
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
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
      const token = localStorage.getItem("admin_token");
      
      // Get user email from JWT token stored in localStorage
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

      const response = await fetch(`${backendUrl}/api/v1/auth/change-password`, {
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

      setSuccess("Password changed successfully!");
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err) {
      setError("An error occurred - make sure backend is running");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className={styles.cardHeader}>
          <h2>Change Password</h2>
          <p>Update your admin account password</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            color: "#166534",
            fontSize: "0.9rem",
            marginBottom: "1rem"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="Enter your current password" 
                required 
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="Enter new password (min 8 characters)" 
                required 
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="Confirm new password" 
                required 
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>

        <div className={styles.forgotPassword}>
          <button 
            type="button"
            onClick={() => router.push("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
