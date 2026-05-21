"use client";
import { useState, useEffect } from "react";

type AStep = "relief_claim" | "all_clear";

interface Props {
  initialStep?: AStep;
}

export default function CitizenAfterPage({ initialStep = "relief_claim" }: Props) {
  const [step, setStep] = useState<AStep>(initialStep);

  useEffect(() => {
    if (initialStep) setStep(initialStep);
  }, [initialStep]);
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <div className="space-y-10">
        {/* ── RELIEF CLAIM ── */}
        {step === "relief_claim" && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
            {/* Hero Banner */}
            <div className="rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg, #E65100 0%, #F57C00 50%, #FFB300 100%)" }}>
              <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-10 bg-white dark:bg-[#232622] blur-3xl" />
              <div className="absolute right-8 bottom-0 w-64 h-64 rounded-full opacity-5 bg-white dark:bg-[#232622] blur-2xl" />
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Priority Relief Distribution</span>
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
                    Your Relief Pack<br />is Ready.
                  </h1>
                  <p className="text-white/80 text-xl font-medium max-w-lg leading-relaxed">
                    Assigned to <strong className="text-white">Station 04</strong>. Please present your claim QR before <strong className="text-white font-black underline underline-offset-4 decoration-2">20:00 tonight.</strong>
                  </p>
                </div>
                {/* QR */}
                <div className="shrink-0 flex flex-col items-center gap-6">
                  <div className="bg-white dark:bg-[#232622] rounded-[2.5rem] p-10 shadow-2xl group transition-transform hover:scale-105 duration-500">
                    <div className="w-52 h-52 bg-[#1A1C19] rounded-3xl p-5 flex items-center justify-center shadow-inner">
                      <div className="grid grid-cols-7 gap-1.5 w-full h-full">
                        {[...Array(49)].map((_, i) => {
                          const isBoundary = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,35,42,43,44,45,46,47,48].includes(i);
                          const isPattern = (i * 9 + 5) % 7 === 0;
                          const shouldFill = isBoundary || isPattern;
                          return <div key={`qr-dot-${i}`} className={`${shouldFill ? "bg-white dark:bg-[#232622]" : "bg-transparent"} rounded-[2px]`} />;
                        })}
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <div className="font-mono font-black text-xl tracking-[0.4em] text-[#1A1C19] dark:text-white">RS-04-A12</div>
                      <div className="text-[#707a6c] dark:text-[#a0a39f] text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Elena Villacruz</div>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-3 py-5 px-10 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-[#6a3800] bg-white dark:bg-[#232622] shadow-xl hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-[1px] transition-all">
                    <span className="material-symbols-outlined text-xl">qr_code_2</span>
                    Present QR
                  </button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Pack Contents */}
              <div className="lg:col-span-7 bg-white dark:bg-[#232622] rounded-[2.5rem] p-10 border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-[#1A1C19] dark:text-white">Essential Supplies</h2>
                    <p className="text-[#707a6c] dark:text-[#a0a39f] font-medium text-sm mt-1">Verified and allocated for your household</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5E9] border border-[#81C784]/40">
                    <div className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2E7D32]">Ready for Pickup</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: "water_full", color: "#1565C0", bg: "#E3F2FD", title: "Potable Water", desc: "Sealed Mineral Containers", qty: "×2" },
                    { icon: "restaurant", color: "#E65100", bg: "#FFF3E0", title: "Prepared Meals", desc: "Shelf-stable Hot Packs", qty: "×3" },
                    { icon: "health_and_safety", color: "#2E7D32", bg: "#E8F5E9", title: "Medical Kit", desc: "First-aid & Sanitation", qty: "×1" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-6 p-6 rounded-[2rem] border border-[#dadad5] dark:border-[#3b3b3b] hover:border-[#2E7D32] transition-all duration-300 bg-[#F5F7F5] dark:bg-[#2e312d] group shadow-sm hover:shadow-md">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: item.bg }}>
                        <span className="material-symbols-outlined text-3xl" style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                      </div>
                      <div className="flex-grow">
                        <div className="font-black text-[#1A1C19] dark:text-white text-lg tracking-tight">{item.title}</div>
                        <div className="text-[#707a6c] dark:text-[#a0a39f] text-xs font-bold uppercase tracking-widest opacity-60">{item.desc}</div>
                      </div>
                      <div className="text-3xl font-black text-[#2E7D32] tabular-nums">{item.qty}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-[#dadad5] dark:border-[#3b3b3b] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#eeeeea] flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-[#707a6c] dark:text-[#a0a39f]">qr_code_scanner</span>
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#707a6c] dark:text-[#a0a39f]">Reference Tracking ID</div>
                      <div className="font-mono font-black text-base text-[#1A1C19] dark:text-white">RS-04-A12-9882X</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#707a6c] dark:text-[#a0a39f]">Package Weight</div>
                    <div className="font-black text-2xl text-[#2E7D32] tabular-nums">4.2 kg</div>
                  </div>
                </div>
              </div>

              {/* Map to Station */}
              <div className="lg:col-span-5 bg-white dark:bg-[#232622] rounded-[2.5rem] border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm overflow-hidden flex flex-col group">
                <div className="p-8 border-b border-[#dadad5] dark:border-[#3b3b3b]">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707a6c] dark:text-[#a0a39f] mb-2 opacity-50">Collection Point</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-3xl text-[#1A1C19] dark:text-white tracking-tight">Station 04</div>
                      <div className="text-[#707a6c] dark:text-[#a0a39f] text-sm font-medium mt-1">Zone A-12 · 450m walk</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: "#E8F5E9" }}>
                      <div className="w-3.5 h-3.5 rounded-full animate-pulse" style={{ background: "#2E7D32" }} />
                    </div>
                  </div>
                </div>
                <div className="flex-grow min-h-[300px] relative overflow-hidden bg-[#fafaf5]">
                  {/* Simulated Map */}
                  <div className="absolute inset-0 opacity-[0.03] grayscale pointer-events-none" 
                    style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/121.05,14.58,15,0/800x800?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}')` }} />
                  <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(46,125,50,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(46,125,50,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-[#2E7D32]/20 animate-ping" />
                      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl relative z-10 transition-transform group-hover:scale-110 duration-500" style={{ background: "#2E7D32" }}>
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
                      </div>
                    </div>
                  </div>

                  {/* Dev Toggle */}
                  <div className="absolute bottom-6 right-6">
                    <button onClick={() => setStep("all_clear")} className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur shadow-xl text-[10px] font-black uppercase tracking-widest text-[#707a6c] dark:text-[#a0a39f] hover:bg-[#1A1C19] hover:text-white transition-all border border-[#dadad5] dark:border-[#3b3b3b]">
                      Simulate All Clear →
                    </button>
                  </div>
                </div>
                <div className="p-8 flex items-center justify-between bg-[#F5F7F5] dark:bg-[#2e312d]">
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95" style={{ background: "linear-gradient(135deg, #2E7D32, #43A047)" }}>
                      <span className="material-symbols-outlined text-white">near_me</span>
                    </button>
                    <div>
                      <span className="font-black text-[#1A1C19] dark:text-white block leading-none mb-1">Start Navigation</span>
                      <span className="text-[#707a6c] dark:text-[#a0a39f] text-[10px] font-bold uppercase tracking-widest">Est. 6 mins away</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ALL CLEAR ── */}
        {step === "all_clear" && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
            {/* Hero */}
            <div className="py-12 space-y-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full text-white shadow-2xl" style={{ background: "linear-gradient(135deg, #2E7D32, #1B5E20)" }}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.25em]">Verified Safety Advisory · PAGASA</span>
                </div>
              </div>
              <h1 className="text-[8rem] lg:text-[12rem] font-black tracking-tighter leading-[0.75] italic select-none" style={{ color: "#2E7D32" }}>
                ALL<br />CLEAR
              </h1>
              <p className="text-[#1a1c19] text-2xl lg:text-3xl font-medium max-w-2xl leading-tight tracking-tight">
                Transit corridors are now fully open. Infrastructure has been successfully restored. You may now <span className="font-black border-b-4 border-[#FFB300] pb-1">safely return home.</span>
              </p>
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "bolt", label: "Power Grid", value: "100% Restored", color: "#FFB300" },
                { icon: "water_drop", label: "Water Supply", value: "Optimal Flow", color: "#1565C0" },
                { icon: "road", label: "Road Access", value: "Corridors Open", color: "#2E7D32" },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-[#232622] rounded-[2rem] p-10 border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner" style={{ background: s.color + "10" }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#707a6c] dark:text-[#a0a39f] mb-3 opacity-50">{s.label}</div>
                  <div className="text-2xl font-black text-[#1A1C19] dark:text-white tracking-tight">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Decision: Leaving or Staying */}
            <div className="bg-[#1A1C19] rounded-[3.5rem] p-16 shadow-2xl space-y-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-[#2E7D32] opacity-5 blur-[120px]" />
              <div className="relative z-10 text-center space-y-4 max-w-xl mx-auto mb-12">
                <h2 className="text-5xl font-black text-white tracking-tight">Departure Registry</h2>
                <p className="text-white/40 text-xl font-medium leading-relaxed">Choose your next step to finalize your recovery journey.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <button onClick={() => setShowCheckout(true)} className="group p-12 rounded-[2.5rem] text-left border-2 border-white/10 hover:border-[#2E7D32] hover:bg-white/5 transition-all duration-500 hover:scale-[1.02]">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-10 group-hover:bg-[#2E7D32] group-hover:text-white transition-all duration-500">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">I&apos;m ready to leave</h3>
                  <p className="text-white/40 text-lg font-medium leading-relaxed mb-10">Final check-out from Station 04. This will deactivate your shelter cot allocation.</p>
                  <div className="flex items-center gap-3 font-black text-sm uppercase tracking-[0.25em]" style={{ color: "#2E7D32" }}>
                    <span>Check Out</span>
                    <span className="material-symbols-outlined text-base group-hover:translate-x-2 transition-transform">arrow_forward</span>
                  </div>
                </button>
                <button className="group p-12 rounded-[2.5rem] text-left border-2 border-white/5 hover:border-[#FFB300] hover:bg-white/5 transition-all duration-500 hover:scale-[1.02]">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-10 group-hover:bg-[#FFB300] group-hover:text-[#1A1C19] dark:text-white transition-all duration-500">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>night_shelter</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">I need more time</h3>
                  <p className="text-white/40 text-lg font-medium leading-relaxed mb-10">Stay registered until your residential corridor is fully inspected and cleared.</p>
                  <div className="flex items-center gap-3 font-black text-sm uppercase tracking-[0.25em] text-white/30">
                    <span>Stay Registered</span>
                    <span className="material-symbols-outlined text-base">more_horiz</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#1A1C19]/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowCheckout(false)} />
          <div className="bg-white dark:bg-[#232622] rounded-[3.5rem] p-12 max-w-lg w-full z-10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl shadow-[#E8F5E9]" style={{ background: "#E8F5E9" }}>
              <span className="material-symbols-outlined text-4xl" style={{ color: "#2E7D32", fontVariationSettings: "'FILL' 1" }}>sensor_door</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-[#1A1C19] dark:text-white tracking-tight">Final Check-out</h3>
              <p className="text-[#707a6c] dark:text-[#a0a39f] text-base font-medium leading-relaxed max-w-xs mx-auto">Present this code to the security personnel at the main gate.</p>
            </div>
            <div className="bg-[#F5F7F5] dark:bg-[#2e312d] rounded-[2.5rem] p-10 inline-block border-2 border-[#eeeeea] shadow-inner w-full max-w-xs mx-auto">
              <div className="w-48 h-48 bg-[#1A1C19] rounded-2xl p-5 flex items-center justify-center mx-auto shadow-2xl">
                <div className="grid grid-cols-6 gap-2 w-full h-full">
                  {[...Array(36)].map((_, i) => (
                    <div key={i} className={`${(i * 13 + 5) % 4 === 0 ? "bg-transparent" : "bg-white dark:bg-[#232622]"} rounded-[2px]`} />
                  ))}
                </div>
              </div>
              <div className="mt-6 font-mono font-black text-xl tracking-[0.3em] text-[#1A1C19] dark:text-white">EXIT-V-0982</div>
            </div>
            <button onClick={() => setShowCheckout(false)} className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-white shadow-xl hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all" style={{ background: "#1A1C19" }}>
              Close Identity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
