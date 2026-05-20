"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { decodeJwt } from "jose";
import styles from "./verify.module.css";

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(600); // 10 minutes for initial OTP
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = searchParams.get("email") || "";

  // OTP ENABLED - Verify that we have an email from a successful login
  useEffect(() => {
    if (!email) {
      setError("No email provided. Please login first.");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } else {
      // Start the countdown for the initial OTP (10 minutes)
      setResendCount(600);
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if they paste or type quickly
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus the next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to the previous input if Backspace is pressed on an empty box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/admin/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || "Failed to verify OTP";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Store token and admin info in localStorage
      if (data.token) {
        // Validate JWT claims before storing
        try {
          const claims = decodeJwt(data.token);
          if (claims.persona !== 'admin' || claims.system !== 'hopecard') {
            // JWT claims mismatch — clear token and show error
            localStorage.removeItem('admin_token');
            setError('Invalid admin credentials');
            setLoading(false);
            return;
          }
        } catch {
          setError('Invalid token received');
          setLoading(false);
          return;
        }
        localStorage.setItem('admin_token', data.token);
        // Set persona cookie after successful token validation
        document.cookie = 'persona=admin; path=/; SameSite=Strict';
      } else {
        // No JWT claims to validate — set persona cookie directly
        document.cookie = 'persona=admin; path=/; SameSite=Strict';
      }

      // Store admin info for display in header
      if (data.admin) {
        localStorage.setItem('admin_info', JSON.stringify({
          id: data.admin.id,
          email: data.admin.email,
          name: data.admin.name,
        }));
      }

      // Verification successful, redirect to dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred during verification");
      console.error(err);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email not found. Please go back to login.");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/admin/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || "Failed to resend OTP";
        setError(errorMessage);
        setResendLoading(false);
        return;
      }

      // Reset OTP inputs and start timer
      setOtp(["", "", "", "", "", ""]);
      setResendLoading(false);
      setResendCount(60);
    } catch (err) {
      setError("Failed to resend OTP");
      console.error(err);
      setResendLoading(false);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCount <= 0) return;

    const interval = setInterval(() => {
      setResendCount(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCount]);

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
            <h2>Verification Code</h2>
            <p>We've sent a 6-digit code to <strong>{email}</strong></p>
          </div>

          {error && (
            <div style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#9b2c2c",
              fontSize: "0.9rem",
              marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className={styles.form}>
            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className={styles.otpInput}
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              className={styles.verifyBtn}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div className={styles.resendSection}>
            <p>
              Didn't receive the code?{" "}
              {resendCount > 0 ? (
                <span className={styles.resendTimer}>
                  Resend ({Math.floor(resendCount / 60)}:{String(resendCount % 60).padStart(2, '0')})
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className={styles.resendBtn}
                >
                  {resendLoading ? "Sending..." : "Resend"}
                </button>
              )}
            </p>
          </div>

          <div className={styles.backToLogin}>
            <Link href="/admin/login">
              <ArrowLeft size={16} className={styles.backIcon} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
