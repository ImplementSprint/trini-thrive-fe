"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, IdCard } from "lucide-react";
import {
  C, AuthShell, AuthTabs, SocialButtons, OrDivider,
  SubmitBtn, MobileLogo,
} from "@/donor-components/auth-shared";

export default function HopecardSignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [barangay, setBarangay] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [province, setProvince] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'digital-donor') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!fileName) {
      setErrorMessage('Please upload a valid ID');
      return;
    }

    if (!agreed) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Step 1: Upload the ID file first (before creating account)
      let idVerificationKey = null;
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];

      if (file) {
        try {
          // Create a temporary user ID based on email for the storage path
          const tempUserId = email.replace(/[^a-z0-9]/gi, '_');

          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', tempUserId);

          const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/upload-id`, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            idVerificationKey = uploadData.path; // Storage bucket path/key
            console.log('ID uploaded successfully:', idVerificationKey);
          } else {
            console.warn('ID upload warning, but continuing with signup');
          }
        } catch (uploadErr) {
          console.warn('ID upload error, but continuing with signup:', uploadErr);
        }
      }

      // Step 2: Create the account and donor profile with the storage path
      const signupRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          barangay,
          municipality,
          province,
          validIdUrl: idVerificationKey, // Storage path/key from upload
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        throw new Error(signupData.error || 'Signup failed');
      }

      // Check if profile creation failed
      if (!signupData.profileCreated && signupData.warning) {
        console.error('Profile creation warning:', signupData.warning);
        setErrorMessage(`Warning: ${signupData.warning}`);
        // Don't redirect - let user see the error
        return;
      }

      // Redirect to confirmation message page
      document.cookie = 'persona=digital-donor; path=/; SameSite=Strict';
      router.push(`/donor/check-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during signup');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      {/* Form Panel */}
      <div
        style={{
          padding: "clamp(2rem, 5vw, 5rem)",
          background: C.surfaceContainerLowest,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Mobile logo */}
        <MobileLogo />

        {/* Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "left" }}>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.875rem", fontWeight: 700, color: C.onPrimaryFixed, marginBottom: "0.5rem", margin: "0 0 0.5rem" }}>
            Create Your Account
          </h2>
          <p style={{ color: C.onSurfaceVariant, margin: 0, fontFamily: "Manrope, sans-serif" }}>
            Start your impact journey today and become part of a compassionate community.
          </p>
        </div>

        {/* Tab switcher */}
        <AuthTabs active="signup" onTabChange={(tab) => tab === "login" && router.push('/donor/login')} />

        {/* Social buttons */}
        <SocialButtons />

        {/* Divider */}
        <OrDivider />

        {/* Error message */}
        {errorMessage && (
          <div style={{ 
            padding: "1rem", 
            marginBottom: "1.5rem", 
            background: "#fef2f2", 
            border: "1px solid #fecaca", 
            borderRadius: "0.75rem",
            color: "#991b1b",
            fontSize: "0.875rem",
            fontFamily: "Manrope, sans-serif"
          }}>
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Name Container */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {/* First Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1, minWidth: "200px" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>First Name</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Evelyn"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "1rem",
                    paddingBottom: "1rem",
                    borderRadius: "1rem",
                    background: C.surfaceContainerHighest,
                    border: "none",
                    outline: "none",
                    color: C.onSurface,
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "1rem",
                    transition: "background 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = C.surfaceContainerLowest;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = C.surfaceContainerHighest;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Last Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1, minWidth: "200px" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Last Name</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Harper"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: "100%",
                    paddingLeft: "3rem",
                    paddingRight: "1rem",
                    paddingTop: "1rem",
                    paddingBottom: "1rem",
                    borderRadius: "1rem",
                    background: C.surfaceContainerHighest,
                    border: "none",
                    outline: "none",
                    color: C.onSurface,
                    fontFamily: "Manrope, sans-serif",
                    fontSize: "1rem",
                    transition: "background 0.15s, box-shadow 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = C.surfaceContainerLowest;
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = C.surfaceContainerHighest;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "1rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  borderRadius: "1rem",
                  background: C.surfaceContainerHighest,
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  transition: "background 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerLowest;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerHighest;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Barangay */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Barangay</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter barangay"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "1rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  borderRadius: "1rem",
                  background: C.surfaceContainerHighest,
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  transition: "background 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerLowest;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerHighest;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Municipality */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Municipality</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "1rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  borderRadius: "1rem",
                  background: C.surfaceContainerHighest,
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  transition: "background 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerLowest;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerHighest;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Province */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Province</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Enter province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "1rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  borderRadius: "1rem",
                  background: C.surfaceContainerHighest,
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  transition: "background 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerLowest;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerHighest;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.onSurfaceVariant, display: "flex" }}>
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "3rem",
                  paddingRight: "3rem",
                  paddingTop: "1rem",
                  paddingBottom: "1rem",
                  borderRadius: "1rem",
                  background: C.surfaceContainerHighest,
                  border: "none",
                  outline: "none",
                  color: C.onSurface,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "1rem",
                  transition: "background 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerLowest;
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${C.primary}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = C.surfaceContainerHighest;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button 
                type="button" 
                onClick={togglePassword} 
                style={{ 
                  position: "absolute", 
                  right: "1rem", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer", 
                  color: C.onSurfaceVariant, 
                  display: "flex" 
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Valid ID Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: C.onSurfaceVariant, paddingLeft: "0.25rem", fontFamily: "Manrope, sans-serif" }}>Valid ID</label>
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                border: `2px dashed ${C.outlineVariant}4d`,
                borderRadius: "1rem",
                background: C.surfaceContainerHighest,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceContainerLow)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.surfaceContainerHighest)}
            >
              <IdCard size={36} style={{ color: C.onSurfaceVariant, marginBottom: "0.5rem" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: fileName ? C.onSurface : C.outlineVariant, fontFamily: "Manrope, sans-serif" }}>
                {fileName ?? "Upload ID (JPG, PNG, PDF)"}
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.5rem 0.25rem" }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreed(e.target.checked)}
              style={{
                width: "1.25rem",
                height: "1.25rem",
                borderRadius: "0.25rem",
                accentColor: C.coralRose,
                cursor: "pointer",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: C.onSurfaceVariant, lineHeight: 1.5, margin: 0, fontFamily: "Manrope, sans-serif" }}>
              By continuing, you agree to Hopecard's{" "}
              <a href="#" style={{ textDecoration: "underline", color: "inherit" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.onPrimaryFixed)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
              >Terms of Service</a>{" "}
              and{" "}
              <a href="#" style={{ textDecoration: "underline", color: "inherit" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.onPrimaryFixed)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
              >Privacy Policy</a>.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "1.25rem",
              borderRadius: "1rem",
              background: C.coralRose,
              color: C.onPrimary,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: "1.125rem",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(242,141,131,0.3)",
              transition: "box-shadow 0.3s, transform 0.3s",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(242,141,131,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(242,141,131,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login link */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ color: C.onSurfaceVariant, fontWeight: 500, fontSize: "0.875rem", margin: 0, fontFamily: "Manrope, sans-serif" }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push('/donor/login')}
              style={{
                background: "none",
                border: "none",
                color: C.onPrimaryFixed, 
                fontWeight: 700,
                textDecoration: "none",
                cursor: "pointer",
                fontFamily: "Manrope, sans-serif",
                fontSize: "0.875rem"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
