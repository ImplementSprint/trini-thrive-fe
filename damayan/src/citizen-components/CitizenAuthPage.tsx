"use client";
import { useState } from "react";

type AuthStep = "login" | "signup" | "forgot" | "verify_id" | "waiting";

interface Props {
  onAuthenticated: () => void;
}

export default function CitizenAuthPage({ onAuthenticated }: Props) {
  const [step, setStep] = useState<AuthStep>("login");

  return (
    <div className="min-h-screen flex font-['Public_Sans']">
      {/* ── LEFT HERO PANEL ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-14"
        style={{ background: "linear-gradient(155deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #43A047 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "#81C784" }} />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-10" style={{ background: "#FFB300" }} />
        <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full opacity-5" style={{ background: "#fff" }} />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">DAMAYAN</span>
          </div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-[0.2em]">Citizen Emergency Portal</p>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-[#81C784] animate-pulse" />
            <span className="text-white/80 text-xs font-bold uppercase tracking-widest">System Active — Mindanao Region</span>
          </div>
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Your safety<br />is our<br /><span style={{ color: "#FFB300" }}>mission.</span>
          </h1>
          <p className="text-white/70 text-lg font-medium max-w-sm leading-relaxed">
            Access real-time evacuation routes, relief distribution, and emergency support — all in one place.
          </p>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { v: "12,400", l: "Citizens Served" },
              { v: "38", l: "Active Shelters" },
              { v: "99.2%", l: "Relief Accuracy" },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-black text-white">{s.v}</div>
                <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/60 text-sm">shield</span>
          </div>
          <p className="text-white/40 text-xs font-medium">End-to-end encrypted · DICT Certified · ISO 27001</p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12" style={{ background: "#F5F7F5" }}>
        {/* Mobile brand */}
        <div className="lg:hidden mb-10 text-center">
          <span className="text-3xl font-black" style={{ color: "#2E7D32" }}>DAMAYAN</span>
          <p className="text-[#444941] text-sm mt-1">Citizen Emergency Portal</p>
        </div>

        <div className="w-full max-w-[420px]">
          {/* ─ LOGIN ─ */}
          {step === "login" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1A1C19" }}>Welcome back</h2>
                <p className="text-[#444941] mt-2 font-medium">Sign in to your Sanctuary account.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941]">Username or Email</label>
                  <input
                    className="w-full px-5 py-4 rounded-2xl border-2 border-[#dadad5] bg-white text-[#1A1C19] font-semibold focus:outline-none focus:border-[#2E7D32] transition-colors text-base"
                    placeholder="e.g. maria.santos@email.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941]">Password</label>
                  <input
                    type="password"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-[#dadad5] bg-white text-[#1A1C19] font-semibold focus:outline-none focus:border-[#2E7D32] transition-colors text-base"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setStep("forgot")} className="text-xs font-black uppercase tracking-widest hover:underline" style={{ color: "#2E7D32" }}>
                    Forgot Password?
                  </button>
                </div>
              </div>
              <button
                onClick={onAuthenticated}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.18em] text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
              >
                Login
              </button>
              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-px bg-[#dadad5]" />
                <span className="text-[#707a6c] text-xs font-bold">OR</span>
                <div className="flex-1 h-px bg-[#dadad5]" />
              </div>
              <p className="text-center text-[#444941] text-sm font-medium">
                Don&apos;t have an account?{" "}
                <button onClick={() => setStep("signup")} className="font-black hover:underline" style={{ color: "#2E7D32" }}>
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* ─ SIGNUP ─ */}
          {step === "signup" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <button onClick={() => setStep("login")} className="flex items-center gap-2 text-[#444941] text-sm font-bold mb-6 hover:text-[#1A1C19] transition-colors">
                  <span className="material-symbols-outlined text-base">arrow_back</span> Back to login
                </button>
                <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1A1C19" }}>Create account</h2>
                <p className="text-[#444941] mt-2 font-medium">Register your emergency identity.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Full Name", placeholder: "Maria Santos", type: "text" },
                  { label: "Username", placeholder: "maria.santos", type: "text" },
                  { label: "Password", placeholder: "••••••••", type: "password" },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941]">{f.label}</label>
                    <input
                      type={f.type}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-[#dadad5] bg-white text-[#1A1C19] font-semibold focus:outline-none focus:border-[#2E7D32] transition-colors text-base"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep("verify_id")}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.18em] text-white shadow-xl hover:scale-[1.02] transition-all"
                style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ─ VERIFY ID ─ */}
          {step === "verify_id" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <button onClick={() => setStep("signup")} className="flex items-center gap-2 text-[#444941] text-sm font-bold mb-6 hover:text-[#1A1C19] transition-colors">
                  <span className="material-symbols-outlined text-base">arrow_back</span> Back
                </button>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#E8F5E9" }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: "#2E7D32", fontVariationSettings: "'FILL' 1" }}>badge</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1A1C19" }}>Verify your identity</h2>
                <p className="text-[#444941] mt-2 font-medium">Upload a valid government-issued ID to complete registration.</p>
              </div>
              <label className="block cursor-pointer group">
                <div className="border-2 border-dashed border-[#81C784] rounded-3xl p-10 text-center bg-[#E8F5E9]/30 group-hover:bg-[#E8F5E9]/60 transition-colors">
                  <span className="material-symbols-outlined text-5xl mb-3 block" style={{ color: "#81C784" }}>upload_file</span>
                  <div className="font-black text-[#2E7D32] mb-1">Click to upload</div>
                  <div className="text-[#444941] text-sm font-medium">JPG, PNG, or PDF · Max 10MB</div>
                  <div className="mt-3 text-xs text-[#707a6c] font-medium">PhilSys ID, Passport, Voter&apos;s ID, Driver&apos;s License</div>
                </div>
                <input type="file" hidden accept="image/*,.pdf" />
              </label>
              <button
                onClick={() => setStep("waiting")}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.18em] text-white shadow-xl hover:scale-[1.02] transition-all"
                style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}
              >
                Submit for Verification
              </button>
            </div>
          )}

          {/* ─ WAITING ─ */}
          {step === "waiting" && (
            <div className="space-y-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative mx-auto w-28 h-28">
                <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ background: "#2E7D32" }} />
                <div className="absolute inset-2 rounded-full opacity-30 animate-ping animation-delay-75" style={{ background: "#2E7D32" }} />
                <div className="w-28 h-28 rounded-full flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #2E7D32, #81C784)" }}>
                  <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1A1C19" }}>Verifying ID</h2>
                <p className="text-[#444941] mt-3 font-medium text-lg leading-relaxed max-w-xs mx-auto">
                  Our responders are reviewing your credentials. This usually takes 5–10 minutes.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#dadad5] space-y-3">
                {["Document Received", "Scanning for Authenticity", "Cross-checking Registry"].map((t, i) => (
                  <div key={t} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${i < 2 ? "bg-[#2E7D32]" : "bg-[#dadad5]"}`}>
                      {i < 2 && <span className="material-symbols-outlined text-white text-xs">check</span>}
                    </div>
                    <span className={`text-sm font-semibold ${i < 2 ? "text-[#1A1C19]" : "text-[#707a6c]"}`}>{t}</span>
                  </div>
                ))}
              </div>
              <button onClick={onAuthenticated} className="text-xs font-black uppercase tracking-widest underline" style={{ color: "#707a6c" }}>
                Skip (demo mode) →
              </button>
            </div>
          )}

          {/* ─ FORGOT ─ */}
          {step === "forgot" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <button onClick={() => setStep("login")} className="flex items-center gap-2 text-[#444941] text-sm font-bold mb-6 hover:text-[#1A1C19] transition-colors">
                  <span className="material-symbols-outlined text-base">arrow_back</span> Back to login
                </button>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#FFF8E1" }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: "#FFB300", fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight" style={{ color: "#1A1C19" }}>Reset password</h2>
                <p className="text-[#444941] mt-2 font-medium">We&apos;ll send a reset link to your email or phone.</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941]">Email or Phone</label>
                <input
                  className="w-full px-5 py-4 rounded-2xl border-2 border-[#dadad5] bg-white text-[#1A1C19] font-semibold focus:outline-none focus:border-[#FFB300] transition-colors text-base"
                  placeholder="e.g. +63 912 345 6789"
                />
              </div>
              <button
                onClick={() => setStep("login")}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.18em] text-white shadow-xl hover:scale-[1.02] transition-all"
                style={{ background: "linear-gradient(135deg, #FFB300, #FFA000)" }}
              >
                Send Reset Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
