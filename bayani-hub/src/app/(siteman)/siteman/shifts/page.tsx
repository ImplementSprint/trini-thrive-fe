"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/siteman-components/layout/DashboardLayout";
import {
  Clock, Check, X, User, History, Search,
  Edit2, ChevronDown, AlertTriangle, CheckCircle, RefreshCw,
} from "lucide-react";
import { LoadingSpinner } from "@/siteman-components/ui/LoadingSpinner";
import { ShiftsAPI } from "@/siteman-lib/api";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Shift {
  id: string;
  volunteer_name: string;
  volunteer_auth_id: string;
  clock_in: string;
  clock_out: string | null;
  status: string;
  total_hours?: number | null;
  computed_hours?: number | null;
  flag_reason?: string | null;
  notes?: string | null;
  application_id?: string | null;
}

type Tab = "pending" | "history";

const FLAG_REASON_LABELS: Record<string, string> = {
  incomplete_task: "Incomplete Task",
  suspicious_request: "Suspicious Request",
  no_show: "No-Show",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "flagged", label: "Flagged" },
  { value: "pending", label: "Pending" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function fmtHours(h: number | null | undefined) {
  if (h == null) return "—";
  return `${Number(h).toFixed(2)} hrs`;
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    approved: { bg: "#DCFCE7", color: "#15803D", label: "Approved" },
    flagged:  { bg: "#FEE2E2", color: "#B91C1C", label: "Flagged" },
    pending:  { bg: "#FEF3C7", color: "#B45309", label: "Pending" },
  };
  const c = cfg[status] ?? { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "9999px", fontSize: "12px",
      fontWeight: 700, backgroundColor: c.bg, color: c.color,
    }}>
      {status === "approved" && <CheckCircle size={11} />}
      {status === "flagged"  && <AlertTriangle size={11} />}
      {status === "pending"  && <Clock size={11} />}
      {c.label}
    </span>
  );
}

/* ─── Edit Modal ─────────────────────────────────────────────────────────── */

interface EditModalProps {
  shift: Shift;
  onClose: () => void;
  onSaved: (updated: Shift) => void;
}

function EditModal({ shift, onClose, onSaved }: EditModalProps) {
  const [status, setStatus]       = useState(shift.status);
  const [hours, setHours]         = useState(
    String(shift.total_hours ?? shift.computed_hours ?? ""),
  );
  const [flagReason, setFlagReason] = useState<string>(shift.flag_reason ?? "incomplete_task");
  const [notes, setNotes]         = useState(shift.notes ?? "");
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      const payload: Parameters<typeof ShiftsAPI.edit>[1] = {};
      if (status !== shift.status) payload.status = status;
      const parsedHours = parseFloat(hours);
      if (!isNaN(parsedHours) && parsedHours !== Number(shift.total_hours)) {
        payload.total_hours = parsedHours;
      }
      if (status === "flagged") {
        payload.flag_reason = flagReason;
      } else {
        payload.flag_reason = null;
      }
      payload.notes = notes;

      const updated = await ShiftsAPI.edit(shift.id, payload);
      onSaved({ ...shift, ...updated });
    } catch (e: any) {
      setErr(e.message ?? "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(17,24,39,0.6)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        width: "100%", maxWidth: "500px", backgroundColor: "white",
        borderRadius: "16px", boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, #5C6ED5 0%, #4F46E5 100%)",
        }}>
          <div>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Edit Shift Record
            </p>
            <h2 style={{ margin: "4px 0 0", color: "white", fontSize: "18px", fontWeight: 700 }}>
              {shift.volunteer_name}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px", color: "white", width: "34px", height: "34px",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Shift info summary */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
            padding: "14px", backgroundColor: "#F9FAFB", borderRadius: "10px",
            border: "1px solid #E5E7EB", fontSize: "13px",
          }}>
            <div><span style={{ color: "#6B7280" }}>Clock In: </span><strong>{fmtDate(shift.clock_in)}</strong></div>
            <div><span style={{ color: "#6B7280" }}>Clock Out: </span><strong>{fmtDate(shift.clock_out)}</strong></div>
            <div><span style={{ color: "#6B7280" }}>Computed: </span><strong>{fmtHours(shift.computed_hours)}</strong></div>
            <div><span style={{ color: "#6B7280" }}>Logged: </span><strong>{fmtHours(shift.total_hours)}</strong></div>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Status
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%", padding: "10px 36px 10px 12px", borderRadius: "8px",
                  border: "1.5px solid #D1D5DB", fontSize: "14px", color: "#111827",
                  appearance: "none", backgroundColor: "white", cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="approved">✓ Approved</option>
                <option value="flagged">⚠ Flagged</option>
                <option value="pending">⏳ Pending Review</option>
              </select>
              <ChevronDown size={16} color="#9CA3AF" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Flag Reason — only if flagged */}
          {status === "flagged" && (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                Flag Reason
              </label>
              <div style={{ display: "grid", gap: "8px" }}>
                {Object.entries(FLAG_REASON_LABELS).map(([val, label]) => (
                  <label key={val} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", borderRadius: "8px", cursor: "pointer",
                    border: flagReason === val ? "1.5px solid #DC2626" : "1px solid #E5E7EB",
                    backgroundColor: flagReason === val ? "#FEF2F2" : "white",
                    fontWeight: 600, fontSize: "13px", color: "#374151",
                  }}>
                    <input
                      type="radio" name="editFlagReason"
                      checked={flagReason === val}
                      onChange={() => setFlagReason(val)}
                      style={{ accentColor: "#DC2626" }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Override Hours */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Override Hours <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(leave blank to use computed value)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={String(shift.computed_hours ?? "")}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1.5px solid #D1D5DB", fontSize: "14px", color: "#111827",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for correction, context, etc."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1.5px solid #D1D5DB", fontSize: "14px", color: "#111827",
                outline: "none", resize: "vertical", fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          {err && (
            <div style={{ padding: "10px 14px", backgroundColor: "#FEF2F2", color: "#B91C1C", borderRadius: "8px", fontSize: "13px", fontWeight: 500 }}>
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid #E5E7EB",
          display: "flex", justifyContent: "flex-end", gap: "10px",
          backgroundColor: "#F9FAFB",
        }}>
          <button onClick={onClose} style={{
            padding: "10px 18px", borderRadius: "8px", border: "1px solid #D1D5DB",
            backgroundColor: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "14px",
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "10px 18px", borderRadius: "8px", border: "none",
            backgroundColor: saving ? "#A5B4FC" : "#5C6ED5",
            color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
            fontSize: "14px", display: "flex", alignItems: "center", gap: "6px",
          }}>
            {saving ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : <><Check size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function ShiftsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  /* Pending state */
  const [pending, setPending]             = useState<Shift[]>([]);
  const [pendingLoading, setPendingLoad]  = useState(true);
  const [pendingErr, setPendingErr]       = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [flaggingShift, setFlaggingShift] = useState<Shift | null>(null);
  const [flagReason, setFlagReason]       = useState<"incomplete_task" | "suspicious_request" | "no_show">("incomplete_task");

  /* History state */
  const [history, setHistory]             = useState<Shift[]>([]);
  const [historyLoading, setHistoryLoad]  = useState(false);
  const [historyErr, setHistoryErr]       = useState<string | null>(null);
  const [historyFetched, setHistoryFetched] = useState(false);
  const [statusFilter, setStatusFilter]   = useState("all");
  const [search, setSearch]               = useState("");
  const [editingShift, setEditingShift]   = useState<Shift | null>(null);

  /* ── Fetch Pending ── */
  const fetchPending = useCallback(async () => {
    setPendingLoad(true);
    setPendingErr(null);
    try {
      const data = await ShiftsAPI.pending();
      setPending(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setPendingErr(err.message ?? "Failed to load pending shifts");
    } finally {
      setPendingLoad(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  /* ── Fetch History ── */
  const fetchHistory = useCallback(async (status = "all") => {
    setHistoryLoad(true);
    setHistoryErr(null);
    try {
      const data = await ShiftsAPI.history({ status: status === "all" ? undefined : status, limit: 200 });
      setHistory(Array.isArray(data) ? data : []);
      setHistoryFetched(true);
    } catch (err: any) {
      setHistoryErr(err.message ?? "Failed to load shift history");
    } finally {
      setHistoryLoad(false);
    }
  }, []);

  /* Load history when tab first becomes active */
  useEffect(() => {
    if (activeTab === "history" && !historyFetched) {
      fetchHistory(statusFilter);
    }
  }, [activeTab, historyFetched, fetchHistory, statusFilter]);

  /* ── Pending Actions ── */
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await ShiftsAPI.approve(id);
      setPending((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (id: string, reason: string) => {
    setActionLoading(id);
    try {
      await ShiftsAPI.deny(id, reason);
      setPending((prev) => prev.filter((s) => s.id !== id));
      setFlaggingShift(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ── History edit callback ── */
  const handleEdited = (updated: Shift) => {
    setHistory((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingShift(null);
  };

  /* ── Filtered history ── */
  const filteredHistory = history.filter((s) => {
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.volunteer_name.toLowerCase().includes(q) ||
      (s.flag_reason ?? "").toLowerCase().includes(q) ||
      (s.notes ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  /* ─── Shared styles ─── */
  const tabBtn = (active: boolean) => ({
    padding: "10px 20px", borderRadius: "8px", border: "none",
    background: active ? "white" : "transparent",
    color: active ? "#5C6ED5" : "#6B7280",
    fontWeight: active ? 700 : 500,
    fontSize: "14px", cursor: "pointer",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
    display: "flex", alignItems: "center", gap: "7px",
    transition: "all 0.15s",
  } as React.CSSProperties);

  return (
    <DashboardLayout>
      {/* ── Flag Reason Modal ── */}
      {flaggingShift && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(17,24,39,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "white", borderRadius: "14px", border: "1px solid #E5E7EB", boxShadow: "0 24px 50px rgba(0,0,0,0.22)", padding: "22px" }}>
            <h2 style={{ margin: "0 0 6px", color: "#111827", fontSize: "20px", fontWeight: 700 }}>Flag Clock-Out</h2>
            <p style={{ margin: "0 0 18px", color: "#6B7280", fontSize: "14px" }}>
              Select the reason before flagging <strong>{flaggingShift.volunteer_name}</strong>&apos;s request.
            </p>
            <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
              {Object.entries(FLAG_REASON_LABELS).map(([val, label]) => (
                <label key={val} style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "12px",
                  border: flagReason === val ? "1px solid #DC2626" : "1px solid #E5E7EB",
                  borderRadius: "10px", cursor: "pointer", color: "#111827", fontWeight: 600, fontSize: "14px",
                  backgroundColor: flagReason === val ? "#FEF2F2" : "white",
                }}>
                  <input type="radio" name="flagReason" checked={flagReason === val}
                    onChange={() => setFlagReason(val as typeof flagReason)} style={{ accentColor: "#DC2626" }} />
                  {label}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setFlaggingShift(null)} style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={() => handleDeny(flaggingShift.id, flagReason)} disabled={actionLoading === flaggingShift.id} style={{ padding: "10px 16px", borderRadius: "8px", border: "none", backgroundColor: "#DC2626", color: "white", fontWeight: 700, cursor: actionLoading === flaggingShift.id ? "not-allowed" : "pointer", opacity: actionLoading === flaggingShift.id ? 0.6 : 1, fontSize: "14px" }}>
                {actionLoading === flaggingShift.id ? "Flagging…" : "Flag Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingShift && (
        <EditModal shift={editingShift} onClose={() => setEditingShift(null)} onSaved={handleEdited} />
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {/* Page header */}
        <div style={{ marginBottom: "24px", marginTop: "8px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: "12px", margin: "0 0 6px" }}>
            <Clock size={26} color="#5C6ED5" />
            Review Shift Hours
          </h1>
          <p style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>
            Review pending clock-outs and audit the complete shift history.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "inline-flex", padding: "4px", borderRadius: "10px",
          backgroundColor: "#F3F4F6", marginBottom: "24px", gap: "2px",
        }}>
          <button style={tabBtn(activeTab === "pending")} onClick={() => setActiveTab("pending")}>
            <Clock size={15} />
            Pending Review
            {pending.length > 0 && (
              <span style={{
                backgroundColor: "#EF4444", color: "white", borderRadius: "9999px",
                fontSize: "11px", fontWeight: 700, padding: "1px 7px", minWidth: "20px", textAlign: "center",
              }}>{pending.length}</span>
            )}
          </button>
          <button style={tabBtn(activeTab === "history")} onClick={() => setActiveTab("history")}>
            <History size={15} />
            Shift History
          </button>
        </div>

        {/* ── PENDING TAB ─────────────────────────────────────────────────── */}
        {activeTab === "pending" && (
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            {pendingLoading ? (
              <LoadingSpinner text="Loading pending shifts…" />
            ) : pendingErr ? (
              <div style={{ padding: "16px", backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", borderRadius: "12px", fontWeight: 500 }}>
                {pendingErr}
              </div>
            ) : pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#6B7280" }}>
                <CheckCircle size={44} color="#10B981" style={{ marginBottom: "14px" }} />
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>All caught up!</p>
                <p style={{ margin: 0, fontSize: "14px" }}>No pending shifts require approval right now.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {pending.map((shift) => (
                  <div key={shift.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 20px", border: "1px solid",
                    borderColor: shift.status === "flagged" ? "#FCA5A5" : "#E5E7EB",
                    borderRadius: "12px",
                    backgroundColor: shift.status === "flagged" ? "#FFF5F5" : "#FAFAFA",
                    gap: "16px", flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center", flex: 1, minWidth: "200px" }}>
                      <div style={{ width: "46px", height: "46px", borderRadius: "12px", backgroundColor: "rgba(92,110,213,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={22} color="#5C6ED5" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "3px" }}>{shift.volunteer_name}</div>
                        <div style={{ fontSize: "13px", color: "#6B7280", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                          <span><strong>In:</strong> {fmtDate(shift.clock_in)}</span>
                          <span><strong>Out:</strong> {fmtDate(shift.clock_out)}</span>
                        </div>
                        {shift.status === "flagged" && (
                          <div style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px", fontWeight: 600 }}>
                            ⚠️ Previously flagged — review pending
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                      <button
                        onClick={() => { setFlagReason("incomplete_task"); setFlaggingShift(shift); }}
                        disabled={actionLoading === shift.id || !shift.clock_out}
                        style={{
                          padding: "8px 16px", backgroundColor: "white", border: "1.5px solid #E5E7EB",
                          color: "#DC2626", borderRadius: "8px", fontWeight: 600, display: "flex",
                          alignItems: "center", gap: "6px", cursor: (actionLoading === shift.id || !shift.clock_out) ? "not-allowed" : "pointer",
                          opacity: (actionLoading === shift.id || !shift.clock_out) ? 0.5 : 1, fontSize: "13px",
                        }}
                      >
                        <X size={14} /> Flag
                      </button>
                      <button
                        onClick={() => handleApprove(shift.id)}
                        disabled={actionLoading === shift.id || !shift.clock_out}
                        style={{
                          padding: "8px 18px", backgroundColor: "#10B981", border: "none",
                          color: "white", borderRadius: "8px", fontWeight: 700, display: "flex",
                          alignItems: "center", gap: "6px",
                          cursor: (actionLoading === shift.id || !shift.clock_out) ? "not-allowed" : "pointer",
                          opacity: (actionLoading === shift.id || !shift.clock_out) ? 0.5 : 1,
                          boxShadow: "0 2px 4px rgba(16,185,129,0.2)", fontSize: "13px",
                        }}
                      >
                        <Check size={14} /> {actionLoading === shift.id ? "Approving…" : "Approve"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ─────────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div>
            {/* Toolbar */}
            <div style={{
              display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center",
            }}>
              {/* Search */}
              <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
                <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Search by volunteer name or notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px",
                    border: "1.5px solid #E5E7EB", fontSize: "14px", color: "#111827",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Status filter */}
              <div style={{ position: "relative" }}>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setHistoryFetched(false); // re-fetch with new filter
                    fetchHistory(e.target.value);
                  }}
                  style={{
                    padding: "10px 36px 10px 12px", borderRadius: "10px",
                    border: "1.5px solid #E5E7EB", fontSize: "14px", color: "#111827",
                    appearance: "none", backgroundColor: "white", cursor: "pointer", outline: "none",
                  }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} color="#9CA3AF" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>

              {/* Refresh */}
              <button
                onClick={() => { setHistoryFetched(false); fetchHistory(statusFilter); }}
                style={{
                  padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
                  backgroundColor: "white", color: "#5C6ED5", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "13px",
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            <div style={{
              backgroundColor: "white", borderRadius: "16px", border: "1px solid #E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden",
            }}>
              {historyLoading ? (
                <div style={{ padding: "40px" }}><LoadingSpinner text="Loading shift history…" /></div>
              ) : historyErr ? (
                <div style={{ padding: "20px", backgroundColor: "#FEF2F2", color: "#DC2626", fontWeight: 500 }}>{historyErr}</div>
              ) : filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#6B7280" }}>
                  <History size={40} color="#D1D5DB" style={{ marginBottom: "14px" }} />
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>No records found</p>
                  <p style={{ margin: 0, fontSize: "13px" }}>Try changing your filters or refreshing.</p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.6fr 1.6fr 0.8fr 1.1fr 1.1fr 80px",
                    padding: "12px 20px", borderBottom: "1px solid #E5E7EB",
                    backgroundColor: "#F9FAFB",
                  }}>
                    {["Volunteer", "Clock In", "Clock Out", "Hours", "Status", "Flag Reason", ""].map((h) => (
                      <span key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
                    ))}
                  </div>

                  {/* Table rows */}
                  {filteredHistory.map((shift, idx) => (
                    <div
                      key={shift.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1.6fr 1.6fr 0.8fr 1.1fr 1.1fr 80px",
                        padding: "14px 20px", alignItems: "center",
                        borderBottom: idx < filteredHistory.length - 1 ? "1px solid #F3F4F6" : "none",
                        backgroundColor: shift.status === "flagged" ? "#FFFBFB" : "white",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = shift.status === "flagged" ? "#FFF5F5" : "#F9FAFB")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = shift.status === "flagged" ? "#FFFBFB" : "white")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(92,110,213,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={16} color="#5C6ED5" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>{shift.volunteer_name}</span>
                      </div>
                      <span style={{ fontSize: "13px", color: "#374151" }}>{fmtDate(shift.clock_in)}</span>
                      <span style={{ fontSize: "13px", color: "#374151" }}>{fmtDate(shift.clock_out)}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                        {fmtHours(shift.total_hours ?? shift.computed_hours)}
                      </span>
                      <div><StatusPill status={shift.status} /></div>
                      <span style={{ fontSize: "12px", color: shift.flag_reason ? "#B91C1C" : "#9CA3AF", fontWeight: shift.flag_reason ? 600 : 400 }}>
                        {shift.flag_reason ? FLAG_REASON_LABELS[shift.flag_reason] ?? shift.flag_reason : "—"}
                      </span>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingShift(shift)}
                          title="Edit this shift record"
                          style={{
                            padding: "6px 10px", borderRadius: "7px",
                            border: "1.5px solid #E5E7EB", backgroundColor: "white",
                            color: "#5C6ED5", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "5px",
                            fontSize: "12px", fontWeight: 600,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EEF2FF"; e.currentTarget.style.borderColor = "#5C6ED5"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Footer count */}
                  <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", backgroundColor: "#F9FAFB" }}>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      Showing {filteredHistory.length} of {history.length} records
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}