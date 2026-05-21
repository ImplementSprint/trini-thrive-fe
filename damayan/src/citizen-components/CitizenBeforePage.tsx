"use client";
import { useState, useEffect } from "react";

type BeforeStep = "registration" | "qr_individual" | "qr_family" | "permissions" | "alert" | "dashboard";

interface Props {
  onGoToDuring: () => void;
  initialStep?: BeforeStep;
}

const checklist = [
  { id: 1, label: "Update Emergency Contact List", done: true },
  { id: 2, label: "Restock 72-Hour Survival Kit", done: true },
  { id: 3, label: "Verify Evacuation Route", done: false },
  { id: 4, label: "Register Household Members", done: false },
];

export default function CitizenBeforePage({ onGoToDuring, initialStep = "registration" }: Props) {
  const [step, setStep] = useState<BeforeStep>(initialStep);

  useEffect(() => {
    if (initialStep) setStep(initialStep);
  }, [initialStep]);
  const [type, setType] = useState<"individual" | "family" | null>(null);
  const [items, setItems] = useState(checklist);
  const [familyMembers, setFamilyMembers] = useState<{id: number}[]>([]);

  function handleChecklistItem(id: number) {
    if (id === 4) {
      // Navigate to family registration
      setStep("registration");
      return;
    }
    setItems((p) => p.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  const done = items.filter((i) => i.done).length;

  return (
    <div className="space-y-8">
        {/* ─ REGISTRATION SELECTION ─ */}
        {step === "registration" && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Back Button (only show if coming from dashboard) */}
            <button onClick={() => setStep("dashboard")} className="flex items-center gap-2 text-[#707a6c] dark:text-[#a0a39f] text-sm font-black mb-8 hover:text-[#1A1C19] dark:text-white transition-all group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span>Return to Dashboard</span>
            </button>

            {/* Phase Banner */}
            <div className="rounded-[2.5rem] p-12 mb-10 relative overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #43A047 100%)" }}>
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-10" style={{ background: "#81C784" }} />
              <div className="absolute right-10 bottom-0 w-40 h-40 rounded-full opacity-5" style={{ background: "#FFB300" }} />
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#81C784] animate-pulse" />
                  <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Identity Management</span>
                </div>
                <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                  {items[3].done ? "Update your" : "Register your"}<br />Emergency Identity
                </h1>
                <p className="text-white/80 text-xl font-medium max-w-xl leading-relaxed">
                  Your identity is your lifeline. A verified QR code enables rapid shelter entry and direct relief support.
                </p>
              </div>
            </div>

            <p className="text-sm font-black uppercase tracking-widest text-[#707a6c] dark:text-[#a0a39f] mb-6 ml-2">Select your registration type</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {[
                {
                  id: "individual" as const,
                  icon: "person",
                  title: "Individual",
                  desc: "Register yourself for rapid check-in, medical tracking, and personal relief claims.",
                  tag: "Single Person",
                },
                {
                  id: "family" as const,
                  icon: "group",
                  title: "Family Household",
                  desc: "Register your whole household for unified aid distribution and family tracking.",
                  tag: "2+ Members",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setType(opt.id); setStep(opt.id === "individual" ? "qr_individual" : "qr_family"); }}
                  className="group text-left p-10 rounded-[2.5rem] bg-white dark:bg-[#232622] border border-[#dadad5] dark:border-[#3b3b3b] hover:border-[#2E7D32] hover:shadow-2xl transition-all duration-500"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm" style={{ background: "#E8F5E9" }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: "#2E7D32", fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#81C784] mb-2">{opt.tag}</div>
                  <h3 className="text-2xl font-black tracking-tight text-[#1A1C19] dark:text-white mb-4">{opt.title}</h3>
                  <p className="text-[#444941] dark:text-[#c4c7c0] font-medium leading-relaxed text-base opacity-80">{opt.desc}</p>
                  <div className="mt-8 flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" style={{ color: "#2E7D32" }}>
                    <span>{items[3].done ? "Update Records" : "Start Registration"}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─ QR INDIVIDUAL ─ */}
        {step === "qr_individual" && (
          <div className="animate-in fade-in zoom-in duration-500 max-w-lg mx-auto text-center space-y-10 py-10">
            <div>
              <button onClick={() => setStep("registration")} className="flex items-center gap-2 text-[#444941] dark:text-[#c4c7c0] text-sm font-bold mb-8 hover:text-[#1A1C19] dark:text-white transition-colors mx-auto group">
                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span> Back
              </button>
              <h2 className="text-4xl font-black tracking-tight text-[#1A1C19] dark:text-white">Your Individual QR Code</h2>
              <p className="text-[#444941] dark:text-[#c4c7c0] font-medium mt-3 text-lg opacity-80">Show this at any Damayan checkpoint for identification.</p>
            </div>
            <div className="bg-white dark:bg-[#232622] rounded-[3rem] p-12 shadow-2xl border border-[#dadad5] dark:border-[#3b3b3b]/40 inline-block mx-auto">
              <div className="w-64 h-64 bg-[#1A1C19] rounded-3xl p-6 mx-auto flex items-center justify-center shadow-inner">
                <div className="grid grid-cols-7 grid-rows-7 gap-1.5 w-full h-full">
                  {[...Array(49)].map((_, i) => {
                    const corners = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48];
                    return <div key={i} className={`${corners.includes(i) || (i * 7 + 3) % 5 === 0 ? "bg-white dark:bg-[#232622]" : "bg-transparent"} rounded-[2px]`} />;
                  })}
                </div>
              </div>
              <div className="mt-8 space-y-2">
                <div className="font-mono font-black text-2xl tracking-[0.4em] text-[#1A1C19] dark:text-white">IND-2891</div>
                <div className="text-[#707a6c] dark:text-[#a0a39f] text-sm font-bold uppercase tracking-widest opacity-60">Elena S. Villacruz</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-[#232622] border border-[#dadad5] dark:border-[#3b3b3b] font-black text-xs uppercase tracking-widest text-[#444941] dark:text-[#c4c7c0] hover:border-[#2E7D32] transition-all hover:shadow-md">
                <span className="material-symbols-outlined text-lg">download</span> Save QR
              </button>
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-[#232622] border border-[#dadad5] dark:border-[#3b3b3b] font-black text-xs uppercase tracking-widest text-[#444941] dark:text-[#c4c7c0] hover:border-[#2E7D32] transition-all hover:shadow-md">
                <span className="material-symbols-outlined text-lg">share</span> Share
              </button>
            </div>
            <button onClick={() => setStep("permissions")} className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white shadow-xl hover:scale-[1.01] active:scale-95 transition-all" style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}>
              Complete Setup
            </button>
          </div>
        )}

        {/* ─ QR FAMILY ─ */}
        {step === "qr_family" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-10 py-6">
            <div>
              <button onClick={() => setStep("registration")} className="flex items-center gap-2 text-[#444941] dark:text-[#c4c7c0] text-sm font-bold mb-8 hover:text-[#1A1C19] dark:text-white transition-colors group">
                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span> Back
              </button>
              <h2 className="text-4xl font-black tracking-tight text-[#1A1C19] dark:text-white">Family Household</h2>
              <p className="text-[#444941] dark:text-[#c4c7c0] font-medium mt-3 text-lg opacity-80">Enter your family details to generate a unified QR.</p>
            </div>
            <div className="bg-white dark:bg-[#232622] rounded-[2.5rem] p-10 border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm space-y-6">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707a6c] dark:text-[#a0a39f] mb-6 border-b pb-4">Head of Household</div>
              {["Full Name", "Age", "Mobile Number"].map((f) => (
                <div key={f} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">{f}</label>
                  <input className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors text-base" placeholder={`Enter ${f.toLowerCase()}`} />
                </div>
              ))}
              <div className="pt-6 border-t border-[#dadad5] dark:border-[#3b3b3b] mt-8">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707a6c] dark:text-[#a0a39f] mb-6">Additional Members</div>
                
                {familyMembers.map((member, idx) => (
                  <div key={member.id} className="relative mb-6 p-6 rounded-2xl bg-[#f4f4ef] dark:bg-[#2e312d]/50 border border-[#dadad5] dark:border-[#3b3b3b] space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#707a6c] dark:text-[#a0a39f]">Member {idx + 1}</span>
                      <button 
                        onClick={() => setFamilyMembers(prev => prev.filter(m => m.id !== member.id))}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Full Name</label>
                      <input className="w-full px-4 py-3 rounded-xl border border-[#dadad5] dark:border-[#3b3b3b] bg-white dark:bg-[#232622] text-[#1A1C19] dark:text-white text-sm focus:outline-none focus:border-[#2E7D32]" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Age</label>
                      <input type="number" min="0" className="w-full px-4 py-3 rounded-xl border border-[#dadad5] dark:border-[#3b3b3b] bg-white dark:bg-[#232622] text-[#1A1C19] dark:text-white text-sm focus:outline-none focus:border-[#2E7D32]" placeholder="Enter age" />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => setFamilyMembers(prev => [...prev, { id: Date.now() }])}
                  className="flex items-center gap-3 text-sm font-black text-[#2E7D32] hover:underline px-2 mt-4"
                >
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  <span>Add Family Member</span>
                </button>
              </div>
            </div>
            <button onClick={() => { 
                setItems(p => p.map(i => i.id === 4 ? { ...i, done: true } : i));
                setStep("permissions"); 
              }} className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white shadow-xl hover:scale-[1.01] active:scale-95 transition-all" style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}>
              Generate Family QR
            </button>
          </div>
        )}

        {/* ─ PERMISSIONS ─ */}
        {step === "permissions" && (
          <div className="animate-in fade-in zoom-in duration-500 max-w-lg mx-auto text-center space-y-12 py-10">
            <div>
               <button onClick={() => setStep(type === "individual" ? "qr_individual" : "qr_family")} className="flex items-center gap-2 text-[#444941] dark:text-[#c4c7c0] text-sm font-bold mb-8 hover:text-[#1A1C19] dark:text-white transition-colors mx-auto group">
                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span> Back
              </button>
              <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl" style={{ background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)" }}>
                <span className="material-symbols-outlined text-6xl" style={{ color: "#2E7D32", fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight text-[#1A1C19] dark:text-white">Stay Alert. Stay Safe.</h2>
              <p className="text-[#444941] dark:text-[#c4c7c0] font-medium text-lg leading-relaxed max-w-sm mx-auto opacity-80">
                Enable notifications to receive instant evacuation orders, rescue alerts, and relief updates.
              </p>
            </div>
            <div className="bg-white dark:bg-[#232622] rounded-3xl p-8 border border-[#dadad5] dark:border-[#3b3b3b] text-left space-y-6 shadow-sm">
              {[
                { icon: "warning", color: "#ba1a1a", t: "Emergency Alerts", d: "Immediate area warnings" },
                { icon: "package_2", color: "#2E7D32", t: "Relief Updates", d: "Supply claim notifications" },
                { icon: "directions_run", color: "#FFB300", t: "Evacuation Guidance", d: "Real-time route updates" },
              ].map((n) => (
                <div key={n.t} className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: n.color + "15" }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: n.color }}>{n.icon}</span>
                  </div>
                  <div>
                    <div className="font-black text-sm text-[#1A1C19] dark:text-white">{n.t}</div>
                    <div className="text-xs text-[#707a6c] dark:text-[#a0a39f] font-medium">{n.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-4">
              <button onClick={() => setStep("alert")} className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white shadow-xl hover:scale-[1.01] active:scale-95 transition-all" style={{ background: "linear-gradient(135deg, #2E7D32, #388E3C)" }}>
                Allow Notifications
              </button>
              <button onClick={() => setStep("alert")} className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#707a6c] dark:text-[#a0a39f] hover:text-[#1A1C19] dark:text-white transition-colors">
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* ─ ALERT ─ */}
        {step === "alert" && (
          <div className="animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto py-10">
            <div className="rounded-[3rem] p-16 text-center space-y-10 relative overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg, #B71C1C, #C62828, #D32F2F)" }}>
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#232622] animate-ping" />
                  <span className="text-white text-[11px] font-black uppercase tracking-[0.2em]">Priority Alert · Sector 4</span>
                </div>
                <div>
                  <div className="text-white/60 text-sm font-black uppercase tracking-[0.3em] mb-4">PAGASA ADVISORY #04</div>
                  <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.95]">FLASH FLOOD<br />WARNING</h2>
                </div>
                <p className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed">
                  Evacuation is now <strong className="text-white">mandatory</strong> for Sector 4. High-risk zones must report to shelters within 120 minutes.
                </p>
                <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto pt-4">
                  <div className="bg-white/10 border border-white/20 rounded-[2rem] p-6 backdrop-blur-sm">
                    <div className="text-4xl font-black text-white leading-none">120</div>
                    <div className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Minutes</div>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-[2rem] p-6 backdrop-blur-sm">
                    <div className="text-4xl font-black text-white leading-none">20cm</div>
                    <div className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Surge</div>
                  </div>
                </div>
                <button onClick={() => setStep("dashboard")} className="w-full py-6 rounded-2xl font-black text-xl text-[#B71C1C] bg-white dark:bg-[#232622] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-6">
                  Acknowledge & View Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─ DASHBOARD ─ */}
        {step === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            {/* Status banner */}
            <div className="rounded-[2.5rem] p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-xl" style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
                  <div className="w-2 h-2 rounded-full bg-[#81C784] animate-pulse" />
                  <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">Prepared · {done}/{items.length} Ready</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">Safety Dashboard</h1>
                <p className="text-white/60 font-medium mt-3 text-lg">Complete your audit before the next advisory.</p>
              </div>
              <button
                onClick={onGoToDuring}
                className="shrink-0 flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-[#2E7D32] bg-white dark:bg-[#232622] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                Simulate Emergency
              </button>
            </div>

            {/* Progress + Checklist */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white dark:bg-[#232622] rounded-[2.5rem] p-10 border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-[#1A1C19] dark:text-white tracking-tight">Ready-Check Audit</h3>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-widest text-[#2E7D32]">{Math.round((done / items.length) * 100)}% Complete</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-[#E8F5E9] mb-10 overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${(done / items.length) * 100}%`, background: "linear-gradient(90deg, #2E7D32, #81C784)" }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <button key={item.id} onClick={() => handleChecklistItem(item.id)} className="flex items-center gap-5 p-6 rounded-2xl bg-[#F5F7F5] dark:bg-[#2e312d] hover:bg-white dark:bg-[#232622] border-2 border-transparent hover:border-[#2E7D32] transition-all group text-left">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${item.done ? "shadow-lg shadow-[#2E7D32]/20" : "border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-white dark:bg-[#232622]"}`} style={item.done ? { background: "#2E7D32" } : {}}>
                        {item.done && <span className="material-symbols-outlined text-white text-base">check</span>}
                      </div>
                      <div className="flex-grow">
                        <span className={`text-sm font-bold block ${item.done ? "text-[#707a6c] dark:text-[#a0a39f] line-through opacity-50" : "text-[#1A1C19] dark:text-white"}`}>{item.label}</span>
                      </div>
                      {item.id === 4 && (
                         <span className="material-symbols-outlined text-[#2E7D32] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#232622] rounded-[2rem] p-8 border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm group hover:shadow-xl transition-all">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707a6c] dark:text-[#a0a39f] mb-6 border-b pb-3">Digital Identity</h4>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#1A1C19] rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-white text-3xl">qr_code_2</span>
                    </div>
                    <div>
                      <div className="font-black text-[#1A1C19] dark:text-white text-base tracking-tight leading-none mb-1">IND-2891</div>
                      <div className="text-[#707a6c] dark:text-[#a0a39f] text-xs font-bold uppercase tracking-widest opacity-60">Elena Villacruz</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E9]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#2E7D32]">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] p-8 text-white space-y-4 relative overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #E65100, #F57C00)" }}>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 bg-white dark:bg-[#232622]" />
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <div>
                    <div className="font-black text-xl leading-tight mb-1">Typhoon Amang</div>
                    <div className="text-white/70 text-xs font-bold uppercase tracking-widest">Level 2 Alert · 72h ETA</div>
                  </div>
                  <p className="text-white/80 text-sm font-medium leading-relaxed">
                    Expected landfall in northern sector. Review evacuation routes now.
                  </p>
                  <button className="w-full bg-white dark:bg-[#232622] text-[#E65100] py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-lg">
                    View Safety Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
