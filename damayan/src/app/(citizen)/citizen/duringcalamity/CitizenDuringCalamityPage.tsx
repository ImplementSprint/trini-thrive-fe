"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FlowStep =
  | "rescue_decision"
  | "report_incident"
  | "self_evacuate"
  | "internet_decision"
  | "sms_code"
  | "delivery_confirmation"
  | "wait_rescue"
  | "safe_zone_map"
  | "navigate_evacuation"
  | "arrive_site"
  | "credential_check"
  | "logged_in";

// The longest flow path for progress tracking
const STEP_ORDER: FlowStep[] = [
  "rescue_decision",
  "report_incident",
  "internet_decision",
  "delivery_confirmation",
  "wait_rescue",
  "arrive_site",
  "credential_check",
  "logged_in",
];

const shelterOptions = [
  { name: "Brgy. Hall Safe Zone", distance: "1.2 km", capacity: "320 / 500", status: "Open" },
  { name: "San Miguel Elementary", distance: "2.4 km", capacity: "180 / 400", status: "Open" },
];

const sidebarLinks = [
  { label: "Home", icon: "H", key: "home", href: "/citizen/beforecalamity" },
  { label: "Checklists", icon: "C", key: "checklists", href: "/citizen/beforecalamity#checklists" },
  { label: "Reporting", icon: "R", key: "report", href: "#reporting" },
  { label: "Support", icon: "S", key: "support", href: "#support" },
];

function getStepMeta(step: FlowStep) {
  switch (step) {
    case "rescue_decision":
      return { label: "Safety Check", accent: "danger" };
    case "report_incident":
      return { label: "Report Alert", accent: "danger" };
    case "self_evacuate":
      return { label: "Find Safe Zone", accent: "safe" };
    case "internet_decision":
      return { label: "Internet Connection", accent: "info" };
    case "sms_code":
      return { label: "Offline Text Mode", accent: "warning" };
    case "delivery_confirmation":
      return { label: "Report Delivered", accent: "safe" };
    case "wait_rescue":
      return { label: "Wait For Rescue", accent: "warning" };
    case "safe_zone_map":
      return { label: "Safe Zone Map", accent: "safe" };
    case "navigate_evacuation":
      return { label: "Navigation", accent: "info" };
    case "arrive_site":
      return { label: "Shelter Arrival", accent: "safe" };
    case "credential_check":
      return { label: "My QR Code", accent: "safe" };
    case "logged_in":
      return { label: "Check-In Complete", accent: "safe" };
  }
}

export default function CitizenDuringCalamityPage() {
  const [step, setStep] = useState<FlowStep>("rescue_decision");
  const [activeSidebarItem, setActiveSidebarItem] = useState("report");
  
  // State data collected during the flow
  const [rescueNeeded, setRescueNeeded] = useState<boolean | null>(null);
  const [internetAvailable, setInternetAvailable] = useState<boolean | null>(null);
  const [identityType, setIdentityType] = useState<"INDIVIDUAL" | "FAMILY" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    return selectedFile ? URL.createObjectURL(selectedFile) : null;
  }, [selectedFile]);

  const currentStepIndex = Math.max(STEP_ORDER.indexOf(step), 0);
  const progress = `${Math.min(((currentStepIndex + 1) / STEP_ORDER.length) * 100, 100)}%`;
  const stepMeta = getStepMeta(step);

  useEffect(() => {
    function syncActiveSidebarItem() {
      const hash = window.location.hash;
      if (hash === "#support") {
        setActiveSidebarItem("support");
        return;
      }
      setActiveSidebarItem("report");
    }

    syncActiveSidebarItem();
    window.addEventListener("hashchange", syncActiveSidebarItem);
    return () => {
      window.removeEventListener("hashchange", syncActiveSidebarItem);
    };
  }, []);

  async function handleCopySms() {
    const code = "DAM-7821";
    try {
      await navigator.clipboard.writeText(code);
      window.alert("Emergency code copied.");
    } catch {
      window.alert(`Copy this code manually: ${code}`);
    }
  }

  function renderStepContent() {
    if (step === "rescue_decision") {
      return (
        <div className="wizard-panel-body">
          <h2>Are you in need of immediate rescue?</h2>
          <p>Choose your current condition so the platform can route you to either an emergency rescue request or a guided self-evacuation path.</p>

          <div className="wizard-choices-grid">
            <button
              className="wizard-choice is-danger"
              onClick={() => {
                setRescueNeeded(true);
                setStep("report_incident");
              }}
            >
              <h3>Yes, I need rescue</h3>
              <p>Report my incident and alert dispatch immediately to my location.</p>
            </button>
            <button
              className="wizard-choice"
              onClick={() => {
                setRescueNeeded(false);
                setStep("self_evacuate");
              }}
            >
              <h3>No, I can self-evacuate</h3>
              <p>Show the nearest safe zone and the best evacuation route to get there.</p>
            </button>
          </div>
        </div>
      );
    }

    if (step === "report_incident") {
      return (
        <div className="wizard-panel-body">
          <h2>Report your emergency</h2>
          <p>Please describe your situation and upload a photo. This helps dispatchers prioritize your rescue quickly.</p>

          <div style={{ marginTop: "2rem" }}>
            <label style={{ display: "block", fontSize: "1.05rem", fontWeight: 800, color: "#1a1c19", marginBottom: "0.5rem" }}>Incident Description</label>
            <textarea 
              placeholder="E.g., Flood waters rising rapidly, need immediate medical assistance for an elderly family member..."
              style={{ width: "100%", padding: "1.25rem", borderRadius: "1rem", border: "1.5px solid rgba(112, 122, 108, 0.2)", fontSize: "1rem", minHeight: "100px", resize: "vertical", background: "#f9f9f6", fontFamily: "inherit" }}
            />
          </div>

          <div className="wizard-upload-area">
            {selectedFile && previewUrl ? (
              <div className="wizard-image-preview">
                <img src={previewUrl} alt="Incident preview" />
                <button type="button" className="wizard-remove-photo" onClick={() => setSelectedFile(null)}>✕</button>
                <div className="wizard-photo-badge">✓ Photo Attached</div>
              </div>
            ) : (
              <label className="wizard-upload-box" htmlFor="citizen-report-file">
                <input
                  id="citizen-report-file"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                  }}
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <strong>Attach Photo Evidence</strong>
                <span>Click here or drag and drop an image (Max 10MB)</span>
              </label>
            )}
          </div>

          <div className="wizard-info-stack">
            <div className="wizard-info-row is-danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <div className="wizard-info-content">
                <strong>Current Location Locked</strong>
                <span>Brgy. 102, District 4 - Zone Red</span>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="wizard-action-btn is-secondary" onClick={() => setStep("rescue_decision")}>Back</button>
            <button className="wizard-action-btn is-danger" disabled={!selectedFile} onClick={() => setStep("internet_decision")}>Submit Evidence</button>
          </div>
        </div>
      );
    }

    if (step === "internet_decision") {
      return (
        <div className="wizard-panel-body">
          <h2>Ready to Send</h2>
          <p>We are ready to send your report. Do you have an active internet connection to submit the photo online?</p>

          <div className="wizard-choices-grid">
            <button
              className="wizard-choice is-info"
              onClick={() => {
                setInternetAvailable(true);
                setStep("delivery_confirmation");
              }}
            >
              <h3>Yes, I have internet</h3>
              <p>Send my full report with the photo immediately.</p>
            </button>
            <button
              className="wizard-choice"
              onClick={() => {
                setInternetAvailable(false);
                setStep("sms_code");
              }}
            >
              <h3>No, use text message</h3>
              <p>Generate an offline text code to send (your photo will be skipped).</p>
            </button>
          </div>
          
          <div className="wizard-footer">
            <button className="wizard-action-btn is-secondary" onClick={() => setStep(rescueNeeded ? "report_incident" : "self_evacuate")}>Back</button>
          </div>
        </div>
      );
    }

    if (step === "sms_code") {
      return (
        <div className="wizard-panel-body">
          <h2>Offline text code ready</h2>
          <p>Because you have no internet, please send this secure code as a regular text message.</p>

          <div className="wizard-sms-box">
            <strong>DAM-7821</strong>
            <span>Text this exact code to hotline <b>143</b>. Do not add any other words.</span>
          </div>

          <div className="wizard-footer">
            <button className="wizard-action-btn is-secondary" onClick={() => setStep("internet_decision")}>Back</button>
            <button className="wizard-action-btn is-secondary" onClick={handleCopySms}>Copy Code</button>
            <button className="wizard-action-btn is-warning" onClick={() => setStep("delivery_confirmation")}>I&apos;ve Sent The SMS</button>
          </div>
        </div>
      );
    }

    if (step === "delivery_confirmation") {
      return (
        <div className="wizard-panel-body">
          <h2>Report delivered successfully</h2>
          <p>Your incident has been successfully injected into the municipal response grid. A dispatcher is reviewing your data right now.</p>

          <div className="wizard-info-stack">
            <div className="wizard-info-row is-safe">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d631b" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
              <div className="wizard-info-content">
                <strong>Dispatcher Assigned</strong>
                <span>Officer Reyes - Response Unit 4</span>
              </div>
            </div>
            <div className="wizard-info-row is-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0061a4" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <div className="wizard-info-content">
                <strong>Estimated Response Time</strong>
                <span>12-18 minutes until contact</span>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="wizard-action-btn is-primary" onClick={() => setStep("wait_rescue")}>
              View Live Status
            </button>
          </div>
        </div>
      );
    }

    if (step === "wait_rescue") {
      return (
        <div className="wizard-panel-body">
          <h2>Rescue is on the way</h2>
          <p>Stay near your reported location. Response Unit 4 has secured your coordinates and is currently navigating through Sector B.</p>

          <div className="wizard-info-stack">
            <div className="wizard-info-row is-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0061a4" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <div className="wizard-info-content">
                <strong>Status: Navigating</strong>
                <span>ETA: 9 minutes remaining</span>
              </div>
            </div>
            <div className="wizard-info-row is-safe">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d631b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <div className="wizard-info-content">
                <strong>Instructions</strong>
                <span>Please ensure all household members are ready with IDs.</span>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="wizard-action-btn is-primary" onClick={() => setStep("arrive_site")}>Fast-Forward: Arrive at Evacuation Site</button>
          </div>
        </div>
      );
    }

    if (step === "self_evacuate") {
      return (
        <div className="wizard-panel-body">
          <h2>Prepare for Self-Evacuation</h2>
          <p>Please secure your belongings and head to the nearest operational safe zone. Your digital ID will be required for check-in.</p>

          <div className="wizard-info-stack">
            <div className="wizard-info-row is-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0061a4" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              <div className="wizard-info-content">
                <strong>Digital ID Ready</strong>
                <span>Your Damayan QR profile is active offline.</span>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="wizard-action-btn is-secondary" onClick={() => setStep("rescue_decision")}>Back</button>
            <button className="wizard-action-btn is-primary" onClick={() => setStep("safe_zone_map")}>Show Nearest Safe Zones</button>
          </div>
        </div>
      );
    }

    if (step === "safe_zone_map") {
      return (
        <div className="wizard-panel-body">
          <h2>Active Safe Zones</h2>
          <p>Select the most accessible shelter based on your location and available capacity.</p>

          {shelterOptions.map((zone) => (
            <div key={zone.name} className="wizard-shelter-card">
              <div>
                <h4>{zone.name}</h4>
                <p>{zone.distance} away - Capacity {zone.capacity}</p>
              </div>
              <span className="wizard-shelter-badge">{zone.status}</span>
            </div>
          ))}

          <div className="wizard-footer">
            <button className="wizard-action-btn is-secondary" onClick={() => setStep("self_evacuate")}>Back</button>
            <button className="wizard-action-btn is-primary" onClick={() => setStep("navigate_evacuation")}>Begin Navigation</button>
          </div>
        </div>
      );
    }

    if (step === "navigate_evacuation") {
      return (
        <div className="wizard-panel-body">
          <h2>Navigation Active</h2>
          <p>Follow the cleared corridor toward Brgy. Hall Safe Zone. Avoid marked flood zones and follow ground responder instructions.</p>

          <div className="wizard-info-stack">
            <div className="wizard-info-row is-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#feb300" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <div className="wizard-info-content">
                <strong>Route Alert</strong>
                <span>Avoid Flood Zone A. Use the alternate east corridor.</span>
              </div>
            </div>
            <div className="wizard-info-row is-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0061a4" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              <div className="wizard-info-content">
                <strong>Travel Estimate</strong>
                <span>12 minutes remaining on foot.</span>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="wizard-action-btn is-secondary" onClick={() => setStep("safe_zone_map")}>Back</button>
            <button className="wizard-action-btn is-info" onClick={() => setStep("arrive_site")}>I Have Arrived</button>
          </div>
        </div>
      );
    }

    if (step === "arrive_site") {
      return (
        <div className="wizard-panel-body">
          <h2>Welcome to the Shelter</h2>
          <p>You have successfully reached the evacuation center. Please proceed to the check-in lane to formally register your arrival.</p>

          <div className="wizard-footer">
            <button className="wizard-action-btn is-primary" onClick={() => setStep("credential_check")}>Present Credentials</button>
          </div>
        </div>
      );
    }

    if (step === "credential_check") {
      return (
        <div className="wizard-panel-body">
          <h2>Show your QR Code</h2>
          <p>Please show this digital ID to the shelter staff. Are you checking in just yourself, or your whole family?</p>

          <div className="wizard-qr-box">
            <div className="wizard-qr-frame">
              <div className="wizard-qr-img" />
            </div>
            <h4>Citizen ID 284-991-001</h4>
            <p>Elena S. Villacruz - District 2</p>
          </div>

          <div className="wizard-choices-grid">
            <button className="wizard-choice is-safe" onClick={() => { setIdentityType("INDIVIDUAL"); setStep("logged_in"); }}>
              <h3>Just Myself</h3>
              <p>Check in as an individual.</p>
            </button>
            <button className="wizard-choice" onClick={() => { setIdentityType("FAMILY"); setStep("logged_in"); }}>
              <h3>Whole Family</h3>
              <p>Check in myself and my family members.</p>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="wizard-panel-body">
        <h2>{identityType === "INDIVIDUAL" ? "Individual Checked In" : "Household Checked In"}</h2>
        <p>You have been successfully logged into the municipal shelter system at Brgy. Hall Safe Zone.</p>

        <div className="wizard-info-stack">
          <div className="wizard-info-row is-safe">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d631b" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
            <div className="wizard-info-content">
              <strong>Assigned Space</strong>
              <span>{identityType === "INDIVIDUAL" ? "Shelter Bay 4B, Cot 12" : "Family Suite F-12"}</span>
            </div>
          </div>
          <div className="wizard-info-row is-safe">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d631b" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            <div className="wizard-info-content">
              <strong>Meal Schedule</strong>
              <span>Breakfast 7AM • Lunch 12PM • Dinner 6PM</span>
            </div>
          </div>
        </div>

        <div className="wizard-footer">
          <button className="wizard-action-btn is-primary" onClick={() => setStep("rescue_decision")}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="citizen-response-page">
      <aside className="citizen-response-sidebar">
        <div className="citizen-response-sidebar-brand">
          <h1>Citizen Portal</h1>
          <p>Stay Safe, Stay Informed</p>
        </div>
        <nav className="citizen-response-sidebar-nav" aria-label="Citizen sections">
          {sidebarLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={activeSidebarItem === item.key ? "is-active" : ""}
              onClick={() => setActiveSidebarItem(item.key)}
            >
              <span className="citizen-response-nav-icon">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="citizen-response-sidebar-footer">
          <Link className="citizen-response-backlink" href="/citizen/beforecalamity">
            Back To Prepare
          </Link>
          <Link className="citizen-response-signout" href="/citizen/login">Sign Out</Link>
        </div>
      </aside>

      <main className="wizard-immersive-zone">
        <div className="wizard-map-background">
          <div className="wizard-map-image" />
          <div className="wizard-map-overlay" />
        </div>

        <header className="wizard-topbar">
          <Link className="wizard-logo" href="/citizen/duringcalamity">DAMAYAN Emergency Dashboard</Link>
          <div className="wizard-topbar-actions">
            <a className="wizard-btn is-sos" href="#sos" onClick={(e) => { e.preventDefault(); setRescueNeeded(true); setStep("report_incident"); }}>Trigger SOS</a>
            <a className="wizard-btn is-report" href="#report" onClick={(e) => { e.preventDefault(); setStep("report_incident"); }}>Report Incident</a>
          </div>
        </header>

        <section className="wizard-content-area" id="reporting">
          <div className="wizard-glass-panel">
            <div className="wizard-panel-header">
              <span className={`wizard-step-tag is-${stepMeta.accent}`}>{stepMeta.label}</span>
              <div className="wizard-progress-track" aria-label="Progress Bar">
                <div className="wizard-progress-fill" style={{ width: progress }} />
              </div>
            </div>

            {renderStepContent()}
          </div>
          
          <section className="citizen-response-footer-actions" id="support" />
        </section>
      </main>
    </div>
  );
}
