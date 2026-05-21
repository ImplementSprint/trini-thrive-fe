"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Mount-time stale cookie check
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'admin') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/admin/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("🔍 Login response status:", response.status);
      console.log("🔍 Login response ok:", response.ok);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let data: any = {};
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        console.log("🔍 Login response data:", data);
      } else {
        const text = await response.text();
        console.error("❌ API returned non-JSON:", text.substring(0, 200));
        setError(`Server error (${response.status}): Invalid response format`);
        setLoading(false);
        return;
      }

      // Handle non-200 responses
      if (!response.ok) {
        const errorMessage = data.error || data.message || `Login failed (${response.status})`;
        console.log("❌ Login error:", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Success branch
      console.log("✅ Login successful, redirecting to OTP");
      localStorage.setItem("pending_email", email);
      router.push(`/admin/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginContainer}>

        <div className={styles.logoSection}>
          <div className={styles.logoMark}>
            <Image
              src="/admin/HopeCard%20Logo.png"
              alt="HopeCard Logo"
              width={60}
              height={60}
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className={styles.logoText}>HopeCard</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Welcome Back</h2>
            <p>Sign in to access the admin portal</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
