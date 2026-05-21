"use client";
import { useState, useEffect } from "react";

type DStep = "decision" | "report" | "internet" | "sms" | "delivered" | "waiting" | "map" | "arrive" | "checkin" | "logged_in";

interface Props { 
  onGoToAfter: () => void; 
  initialStep?: DStep;
}

export default function CitizenDuringPage({ onGoToAfter, initialStep = "decision" }: Props) {
  const [step, setStep] = useState<DStep>(initialStep);

  useEffect(() => {
    if (initialStep) setStep(initialStep);
  }, [initialStep]);
  const [needsRescue, setNeedsRescue] = useState(false);
  const [checkinType, setCheckinType] = useState<"individual"|"family"|null>(null);

  const Header = ({ title, back, backStep }: { title: string; back?: string; backStep?: DStep }) => (
    <div className="mb-8">
      {back && backStep && (
        <button onClick={() => setStep(backStep)} className="flex items-center gap-2 text-[#444941] dark:text-[#c4c7c0] text-sm font-bold mb-5 hover:text-[#1A1C19] dark:text-white transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span> {back}
        </button>
      )}
      <h2 className="text-3xl font-black tracking-tight text-[#1A1C19] dark:text-white">{title}</h2>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* ─ Progress Tracker ─ */}
      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-[#dadad5] dark:border-[#3b3b3b] w-fit mx-auto shadow-sm">
        {(["decision","report","delivered","waiting","arrive","checkin","logged_in"] as DStep[]).map((s, i) => (
          <div key={s} className={`h-2 rounded-full transition-all duration-500 ${step === s ? "w-10" : "w-3"}`}
            style={{ background: step === s ? "#FFB300" : "#dadad5" }} />
        ))}
      </div>

      <div className="bg-[#1a1c19] rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-white/5">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px]" />

        <div className="relative z-10">
          {/* DECISION */}
          {step === "decision" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFB300]/10 border border-[#FFB300]/20 mb-6">
                  <span className="material-symbols-outlined text-sm text-[#FFB300]">crisis_alert</span>
                  <span className="text-[#FFB300] text-[10px] font-black uppercase tracking-[0.2em]">Safety Assessment Required</span>
                </div>
                <h2 className="text-5xl font-black text-white tracking-tight leading-[1.1]">Are you in need of immediate rescue?</h2>
                <p className="text-white/50 font-medium mt-4 text-xl leading-relaxed max-w-xl">Your answer will determine your priority in the emergency response queue.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => { setNeedsRescue(true); setStep("report"); }}
                  className="group p-10 rounded-[2.5rem] text-left border-2 border-red-500/20 hover:border-red-500 transition-all hover:scale-[1.02] duration-500 shadow-lg"
                  style={{ background: "rgba(186,26,26,0.1)" }}>
                  <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-5xl text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Yes, I need rescue</h3>
                  <p className="text-white/50 text-base font-medium leading-relaxed">Report your incident, attach photos, and alert dispatch to your precise location.</p>
                </button>
                <button onClick={() => { setNeedsRescue(false); setStep("map"); }}
                  className="group p-10 rounded-[2.5rem] text-left border-2 border-white/5 hover:border-[#81C784] transition-all hover:scale-[1.02] duration-500 shadow-lg"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-5xl" style={{ color: "#81C784", fontVariationSettings: "'FILL' 1" }}>directions_walk</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">No, I can self-evacuate</h3>
                  <p className="text-white/50 text-base font-medium leading-relaxed">Show me the nearest active safe zones and the most optimal evacuation route.</p>
                </button>
              </div>
            </div>
          )}

          {/* REPORT */}
          {step === "report" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-2xl mx-auto">
              <Header title="Report Emergency" back="Back" backStep="decision" />
              <div className="space-y-6">
                <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 shadow-inner">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-400">location_on</span>
                  </div>
                  <div>
                    <div className="text-red-400 text-[10px] font-black uppercase tracking-widest">Precision Location Locked</div>
                    <div className="text-white font-bold text-lg">Brgy. 102, District 4 · Zone Red</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Incident Description</label>
                  <textarea className="w-full px-6 py-5 rounded-[2rem] border-2 border-white/5 bg-white/5 text-white font-medium focus:outline-none focus:border-[#FFB300] transition-all resize-none min-h-[150px] placeholder-white/20 text-lg shadow-inner" placeholder="Describe your situation in detail…" />
                </div>
                <div className="group border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center cursor-pointer hover:border-[#FFB300]/50 hover:bg-white/5 transition-all shadow-inner">
                  <span className="material-symbols-outlined text-5xl text-white/20 block mb-4 group-hover:scale-110 group-hover:text-[#FFB300] transition-all">add_a_photo</span>
                  <div className="text-white/60 font-black text-lg">Attach Photo Evidence</div>
                  <div className="text-white/20 text-sm mt-2 font-medium">Automatic location metadata inclusion — Max 20MB</div>
                </div>
              </div>
              <button onClick={() => setStep("internet")}
                className="w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-[#1A1C19] dark:text-white hover:scale-[1.01] active:scale-95 transition-all shadow-2xl"
                style={{ background: "linear-gradient(135deg, #FFB300, #FFA000)" }}>
                Submit Emergency Report
              </button>
            </div>
          )}

          {/* INTERNET CHECK */}
          {step === "internet" && (
            <div className="space-y-10 animate-in fade-in duration-500 max-w-2xl mx-auto">
              <Header title="Ready to Transmit" back="Back" backStep="report" />
              <p className="text-white/70 font-medium text-xl leading-relaxed">Do you have an active internet connection to submit the full photo report online?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setStep("delivered")} className="p-10 rounded-[2rem] text-left border-2 border-white/5 hover:border-[#81C784] transition-all hover:scale-[1.02] duration-500" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="material-symbols-outlined text-4xl mb-4 block" style={{ color: "#81C784" }}>wifi</span>
                  <h3 className="text-xl font-black text-white mb-2">Yes, Internet Active</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">Transmit full encrypted report with high-res photos.</p>
                </button>
                <button onClick={() => setStep("sms")} className="p-10 rounded-[2rem] text-left border-2 border-white/5 hover:border-[#FFB300] transition-all hover:scale-[1.02] duration-500" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="material-symbols-outlined text-4xl mb-4 block" style={{ color: "#FFB300" }}>sms</span>
                  <h3 className="text-xl font-black text-white mb-2">No, Use SMS Code</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">Generate compact offline protocol for low-signal areas.</p>
                </button>
              </div>
            </div>
          )}

          {/* SMS */}
          {step === "sms" && (
            <div className="space-y-10 animate-in fade-in duration-500 max-w-2xl mx-auto text-center">
              <Header title="Offline Protocol" back="Back" backStep="internet" />
              <div className="rounded-[2.5rem] p-12 text-center border-2 border-dashed space-y-6 shadow-inner" style={{ background: "rgba(255,179,0,0.05)", borderColor: "rgba(255,179,0,0.2)" }}>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFB300]">Unique Emergency Code</div>
                <div className="text-6xl font-mono font-black text-white tracking-[0.4em]">DAM-7821</div>
                <p className="text-white/50 text-base font-medium">Text this code to emergency hotline <strong className="text-white text-lg underline">143</strong></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={async () => { try { await navigator.clipboard.writeText("DAM-7821"); } catch {} }}
                  className="py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-2 border-white/10 text-white/70 hover:border-[#FFB300] hover:text-white transition-all">
                  Copy Code
                </button>
                <button onClick={() => setStep("delivered")}
                  className="py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-[#1A1C19] dark:text-white shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
                  style={{ background: "#FFB300" }}>
                  I&apos;ve Sent SMS
                </button>
              </div>
            </div>
          )}

          {/* DELIVERED */}
          {step === "delivered" && (
            <div className="space-y-12 text-center animate-in fade-in zoom-in duration-600 py-6 max-w-2xl mx-auto">
              <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl" style={{ background: "rgba(129,199,132,0.1)" }}>
                <span className="material-symbols-outlined text-6xl" style={{ color: "#81C784", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <div>
                <h2 className="text-5xl font-black text-white tracking-tight leading-tight">Report Received</h2>
                <p className="text-white/40 mt-4 text-xl font-medium max-w-sm mx-auto">A dispatcher has been assigned to your emergency case.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                  { icon: "person", color: "#81C784", t: "Dispatcher Assigned", d: "Officer Reyes · Unit 4" },
                  { icon: "schedule", color: "#FFB300", t: "Estimated Response", d: "12–18 minutes" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center gap-5 p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: r.color + "15" }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: r.color }}>{r.icon}</span>
                    </div>
                    <div>
                      <div className="text-white font-black text-sm">{r.t}</div>
                      <div className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{r.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("waiting")} className="w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-[#1A1C19] dark:text-white shadow-2xl hover:scale-[1.01] transition-all" style={{ background: "linear-gradient(135deg, #FFB300, #FFA000)" }}>
                Launch Live Tracker
              </button>
            </div>
          )}

          {/* WAITING */}
          {step === "waiting" && (
            <div className="space-y-12 text-center animate-in fade-in duration-600 py-10 max-w-2xl mx-auto">
              <div className="relative inline-block">
                <div className="w-40 h-40 rounded-full absolute inset-0 animate-ping opacity-10 bg-[#FFB300]" />
                <div className="w-40 h-40 rounded-full flex items-center justify-center relative shadow-2xl border-2 border-white/5" style={{ background: "rgba(255,179,0,0.05)" }}>
                  <span className="material-symbols-outlined text-6xl text-[#FFB300] animate-pulse">radar</span>
                </div>
              </div>
              <div>
                <h2 className="text-5xl font-black text-white tracking-tight leading-tight">Rescue Inbound</h2>
                <p className="text-white/50 mt-4 text-xl font-medium max-w-md mx-auto">Stay exactly where you are. Response Unit 4 is navigating through Sector B to reach you.</p>
              </div>
              <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto">
                {[{ v: "In Transit", l: "Status", c: "#81C784" }, { v: "9m 20s", l: "ETA", c: "#FFB300" }].map((s) => (
                  <div key={s.l} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 shadow-inner">
                    <div className="text-3xl font-black" style={{ color: s.c }}>{s.v}</div>
                    <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mt-3">{s.l}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("arrive")} className="text-white/20 text-xs font-black uppercase tracking-[0.3em] hover:text-[#FFB300] transition-colors pt-6">
                Fast-forward Sim: Reach Shelter →
              </button>
            </div>
          )}

          {/* MAP */}
          {step === "map" && (
            <div className="space-y-10 animate-in fade-in duration-500 max-w-2xl mx-auto">
              <Header title="Live Safe Zones" back="Back" backStep="decision" />
              <p className="text-white/50 font-medium text-xl leading-relaxed">Select the nearest facility. Real-time capacity and route safety are prioritized.</p>
              <div className="space-y-4">
                {[
                  { name: "Brgy. Hall Command Center", dist: "1.2 km", cap: "320 / 500", status: "Optimal" },
                  { name: "San Miguel Evac Hub", dist: "2.4 km", cap: "180 / 400", status: "Secure" },
                  { name: "Sector 4 Regional Shelter", dist: "3.8 km", cap: "492 / 500", status: "Near Full" },
                ].map((z) => (
                  <button key={z.name} onClick={() => setStep("arrive")} className="w-full group flex items-center justify-between p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-[#81C784] hover:bg-white/10 transition-all text-left shadow-lg">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[#81C784]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      </div>
                      <div>
                        <div className="font-black text-white text-xl tracking-tight leading-none mb-1">{z.name}</div>
                        <div className="text-white/40 text-sm font-medium">{z.dist} away · Capacity {z.cap}</div>
                      </div>
                    </div>
                    <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-inner" style={{ background: "rgba(129,199,132,0.1)", color: "#81C784" }}>{z.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ARRIVE */}
          {step === "arrive" && (
            <div className="space-y-12 text-center animate-in fade-in zoom-in duration-600 py-12 max-w-2xl mx-auto">
              <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl bg-white/5">
                <span className="material-symbols-outlined text-7xl" style={{ color: "#81C784", fontVariationSettings: "'FILL' 1" }}>home_pin</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tight leading-tight">Welcome to Safety</h2>
                <p className="text-white/40 mt-4 text-xl font-medium max-w-md mx-auto leading-relaxed">
                  You have safely arrived at the evacuation hub. Proceed to the digital kiosk for automated check-in.
                </p>
              </div>
              <button onClick={() => setStep("checkin")} className="w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white shadow-2xl hover:scale-[1.01] transition-all" style={{ background: "linear-gradient(135deg, #2E7D32, #43A047)" }}>
                Start Arrival Check-in
              </button>
            </div>
          )}

          {/* CHECK-IN PROMPT */}
          {step === "checkin" && (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl mx-auto">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tight leading-tight text-center">Identity Type</h2>
                <p className="text-white/50 text-xl font-medium max-w-sm mx-auto">Select how to log your arrival for precise resource allocation.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: "individual" as const, icon: "person", title: "Individual ID", desc: "Log personal arrival into the shelter registry." },
                  { id: "family" as const, icon: "group", title: "Family Group", desc: "Register unified household arrival for aid packs." },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => { setCheckinType(opt.id); setStep("logged_in"); }}
                    className="p-10 rounded-[2rem] text-left border-2 border-white/5 hover:border-[#81C784] transition-all hover:scale-[1.02] duration-500 shadow-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8">
                      <span className="material-symbols-outlined text-4xl" style={{ color: "#81C784", fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{opt.title}</h3>
                    <p className="text-white/40 text-base font-medium leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LOGGED IN */}
          {step === "logged_in" && (
            <div className="space-y-12 text-center animate-in fade-in zoom-in duration-600 py-10 max-w-2xl mx-auto">
              <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl" style={{ background: "linear-gradient(135deg, #2E7D32, #43A047)" }}>
                <span className="material-symbols-outlined text-white text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
              </div>
              <div>
                <h2 className="text-5xl font-black text-white tracking-tight leading-tight">Check-in Verified</h2>
                <p className="text-white/40 mt-4 text-xl font-medium max-w-md mx-auto leading-relaxed">
                  You are now registered at Station 04. Your assigned resources are being prepared.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                  { icon: "bed", color: "#81C784", t: "Assigned Space", d: checkinType === "individual" ? "Bay 4B, Cot 12" : "Family Suite F-12" },
                  { icon: "restaurant", color: "#FFB300", t: "Meal Schedule", d: "Standard Interval" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center gap-5 p-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: r.color + "15" }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: r.color }}>{r.icon}</span>
                    </div>
                    <div>
                      <div className="text-white font-black text-sm">{r.t}</div>
                      <div className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{r.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={onGoToAfter} className="w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white shadow-2xl hover:scale-[1.01] transition-all" style={{ background: "linear-gradient(135deg, #2E7D32, #43A047)" }}>
                Enter Recovery Phase
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
