'use client';

﻿import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/admin-components/Header";
import Footer from "@/admin-components/Footer";
import styles from "./applicant.module.css";
import { apiFetch } from "@/admin-lib/api";

/** Parse the condensed motivation string into labelled key-value pairs. */
function parseMotivation(raw: string): { label: string; value: string }[] {
  if (!raw) return [];
  // Strip the leading header line if present
  const body = raw.replace(/^Questionnaire Assessment:\n?/i, "");
  // Each field is prefixed with "- Label: Value"
  const lines = body.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const pairs: { label: string; value: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^-?\s*([^:]+):\s*(.*)$/);
    if (match) {
      pairs.push({ label: match[1].trim(), value: match[2].trim() || "N/A" });
    }
  }
  return pairs;
}

interface Applicant {
  id: number;
  name: string;
  title: string;
  role: string;
  appliedDate: string;
  status: string;
  avatar: string;
  gender: string;
  personal: {
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
  };
  experience: {
    title: string;
    description: string;
    skills: string[];
    motivation: string;
  };
  documents: { name: string; size: string; date: string; icon: string; url: string }[];
  timeline: { event: string; date: string; pending: boolean }[];
  references: { name: string; title: string; phone: string }[];
  notes: string;
}

export default function ApplicantDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Applicant["documents"][number] | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchApplicant() {
      setLoading(true);
      try {
        const data = await apiFetch<any>(`/applications/${id}`);

        const profile = data.user_profiles;
        const role = data.volunteer_roles;
        const name = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : "Unknown";
        const createdAt = data.applied_at ? new Date(data.applied_at) : new Date();
        const formattedDate = createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

        const rawStatus = data.status || "pending";
        const formattedStatus = rawStatus === "pending" 
          ? "Under Review" 
          : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
        let uploadedDocumentUrl = "";

        try {
          const documentData = await apiFetch<{ signed_url?: string | null }>(`/documents/application/${id}`);
          uploadedDocumentUrl = documentData.signed_url ?? "";
        } catch (documentError) {
          console.error("Error fetching applicant document:", documentError);
        }

        const uploadedDocuments = uploadedDocumentUrl
          ? [{
              name: data.resume_key ? String(data.resume_key).split("/").pop() || "Uploaded credential" : "Uploaded credential",
              size: "Ready for review",
              date: formattedDate,
              icon: "/placeholder.svg",
              url: uploadedDocumentUrl,
            }]
          : [];

        setApplicant({
          id: data.id,
          name,
          title: `${role?.title ?? "Volunteer"} Application`,
          role: role?.title ?? "Volunteer",
          appliedDate: formattedDate,
          status: formattedStatus,
          avatar: "👤",
          gender: profile?.gender ?? "unknown",
          personal: {
            email: profile?.email ?? "",
            phone: profile?.phone ?? "",
            address: profile ? [profile.address, profile.barangay, profile.municipality, profile.province].filter(Boolean).join(", ") : "",
            emergencyContact: profile?.emergency_contact ?? (
              data.motivation?.match(/- Emergency Contact:\s*(.*)/)?.[1]?.trim()
              ?? [
                data.motivation?.match(/- Emergency Contact Name:\s*(.*)/)?.[1]?.trim(),
                data.motivation?.match(/- Emergency Contact Number:\s*(.*)/)?.[1]?.trim(),
              ].filter(Boolean).join(" - ")
            ),
          },
          experience: {
            title: "General Screening Questionnaire",
            description: data.motivation ?? (Array.isArray(data.skills) ? data.skills.join(", ") : data.skills) ?? "No description provided",
            skills: Array.isArray(data.skills) ? data.skills : data.skills ? String(data.skills).split(",").map((s: string) => s.trim()) : [],
            motivation: data.motivation ?? "",
          },
          documents: uploadedDocuments,
          timeline: [
            { event: "Application Submitted", date: formattedDate, pending: false },
            { event: "Under Review", date: data.reviewed_by ? "Reviewed" : "Pending", pending: data.status === "pending" || data.status === "submitted" },
          ],
          references: [],
          notes: data.internal_notes ?? "",
        });
        setNotes(data.internal_notes ?? "");
      } catch (err) {
        console.error("Error fetching applicant:", err);
        setApplicant(null);
      }
      setLoading(false);
    }
    fetchApplicant();
  }, [id]);

  const getAvatarImage = (gender: string) => {
    const femaleUrl = "https://cdn.builder.io/api/v1/image/assets%2F895651d642164b74988a81b4e99696fb%2Ff9735712ac9445bfa5fc8e23bf5556e0?format=webp&width=800&height=1200";
    const maleUrl = "https://cdn.builder.io/api/v1/image/assets%2F895651d642164b74988a81b4e99696fb%2F5b17614135f047edaec8a0a56e56e95c?format=webp&width=800&height=1200";
    return gender === "female" ? femaleUrl : maleUrl;
  };

  if (loading) {
    return (
      <div className={styles.notFound}>
        <Header />
        <main className={styles.notFoundContent}>
          <div><p className={styles.notFoundText}>Loading applicant...</p></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className={styles.notFound}>
        <Header />
        <main className={styles.notFoundContent}>
          <div>
            <p className={styles.notFoundText}>Applicant not found</p>
            <button
              onClick={() => router.push("/admin/volunteers")}
              className={styles.notFoundButton}
            >
              Back to Volunteers
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveNotes = async () => {
    if (!applicant || isSaving) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await apiFetch(`/applications/${applicant.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ internal_notes: notes }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      setActionError(err?.message ?? 'Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!applicant || actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await apiFetch(`/applications/${applicant.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });
      router.push(`/admin/approval-status?applicationId=${applicant.id}`);
    } catch (err: any) {
      setActionError(err?.message ?? 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!applicant || actionLoading) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await apiFetch(`/applications/${applicant.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      });
      router.push('/admin/rejection-status');
    } catch (err: any) {
      setActionError(err?.message ?? 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateQr = async () => {
    if (!applicant || qrLoading) return;
    setQrLoading(true);
    setActionError(null);
    try {
      const result = await apiFetch<any>("/qr/generate", {
        method: "POST",
        body: JSON.stringify({
          application_id: applicant.id,
          qr_type: "deployment",
        }),
      });
      setQrUrl(result.public_url);
    } catch (err: any) {
      setActionError(err?.message ?? "Failed to generate QR code");
    } finally {
      setQrLoading(false);
    }
  };

  const statusClass = 
    applicant.status === "Approved" ? styles.statusApproved : 
    applicant.status === "Rejected" ? styles.statusRejected : 
    styles.statusUnderReview;

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        {previewDocument && (
          <div className={styles.documentPreviewOverlay}>
            <div className={styles.documentPreviewModal}>
              <div className={styles.documentPreviewHeader}>
                <div>
                  <p className={styles.documentPreviewEyebrow}>Document Review</p>
                  <h2 className={styles.documentPreviewTitle}>{previewDocument.name}</h2>
                </div>
                <button
                  className={styles.documentPreviewClose}
                  onClick={() => setPreviewDocument(null)}
                  aria-label="Close document preview"
                >
                  x
                </button>
              </div>
              <div className={styles.documentPreviewBody}>
                {/\.(png|jpe?g|webp|gif)(\?|$)/i.test(previewDocument.url) ? (
                  <img src={previewDocument.url} alt={previewDocument.name} className={styles.documentPreviewImage} />
                ) : (
                  <iframe src={previewDocument.url} title={previewDocument.name} className={styles.documentPreviewFrame} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div>
          <Link href="/admin/volunteers" className={styles.backButton}>
            <svg className={styles.svg16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        {/* Applicant Header */}
        <div className={styles.applicantHeader}>
          <div className={styles.headerContent}>
            <div className={styles.applicantInfo}>
              <img
                src={getAvatarImage(applicant.gender || "female")}
                alt={applicant.name}
                className={styles.applicantAvatar}
                style={{ objectFit: "contain" }}
              />
              <div>
                <h1 className={styles.applicantName}>{applicant.name}</h1>
                <p className={styles.applicantTitle}>{applicant.title}</p>
                <p className={styles.applicantDate}>Submitted on {applicant.appliedDate}</p>
              </div>
            </div>

            <div className={styles.headerActions}>
              <span className={`${styles.statusBadge} ${statusClass}`}>
                {applicant.status}
              </span>
              {actionError && (
                <span style={{ color: 'red', fontSize: '0.85rem' }}>{actionError}</span>
              )}
              {(applicant.status === "Under Review" || applicant.status === "Submitted") && (
                <>
                  <button
                    onClick={handleApprove}
                    className={styles.approveButton}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={handleReject}
                    className={styles.rejectButton}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.gridLayout}>
          {/* Left Column */}
          <div className={styles.mainColumn}>
            {/* Personal Information */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Volunteer Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Email</label>
                  <p className={styles.infoValue}>{applicant.personal.email}</p>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Phone</label>
                  <p className={styles.infoValue}>{applicant.personal.phone}</p>
                </div>

                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Emergency Contact</label>
                  <p className={styles.infoValue}>{applicant.personal.emergencyContact}</p>
                </div>
              </div>
            </div>

            {/* General Screening Information */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>General Screening Information</h2>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{applicant.experience.title}</h3>

                {(() => {
                  const fields = parseMotivation(applicant.experience.motivation || applicant.experience.description);
                  if (fields.length === 0) {
                    return (
                      <p className={styles.sectionDescription}>
                        {applicant.experience.description || "No questionnaire data available."}
                      </p>
                    );
                  }
                  return (
                    <div className={styles.screeningGrid}>
                      {fields.map((f, i) => (
                        <div key={i} className={styles.screeningItem}>
                          <span className={styles.screeningLabel}>{f.label}</span>
                          <span className={`${styles.screeningValue} ${
                            f.value === "Yes" ? styles.screeningYes :
                            f.value === "No" ? styles.screeningNo : ""
                          }`}>
                            {f.value === "Yes" ? "✓ Yes" : f.value === "No" ? "✗ No" : f.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Roles Applied For</h3>
                <div className={styles.skillsList}>
                  {applicant.experience.skills.map((skill, idx) => (
                    <span key={idx} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Uploaded Documents */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Uploaded Documents</h2>

              <div className={styles.documentsList}>
                {applicant.documents.map((doc, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div className={styles.documentItem} style={{ marginBottom: 0 }}>
                      <div className={styles.documentInfo}>
                        <img src={doc.icon} alt={doc.name} className={styles.documentIcon} />
                        <div className={styles.documentMeta}>
                          <p className={styles.documentName}>{doc.name}</p>
                          <p className={styles.documentSize}>{doc.size} • Uploaded {doc.date}</p>
                        </div>
                      </div>
                      <div className={styles.documentActions}>
                        <button
                          className={styles.documentButton}
                          title="View"
                          onClick={() => setPreviewDocument(doc)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Inline Document Preview */}
                    {doc.url && (
                      <div style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", backgroundColor: "#F9FAFB" }}>
                        {/\.(png|jpe?g|webp|gif)(\?|$)/i.test(doc.url) ? (
                          <img src={doc.url} alt={doc.name} style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "contain", display: "block" }} />
                        ) : (
                          <iframe src={doc.url} title={doc.name} style={{ width: "100%", height: "500px", border: "none", display: "block" }} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {applicant.documents.length === 0 && (
                  <div className={styles.emptyDocumentState}>
                    No uploaded documents were attached to this application.
                  </div>
                )}
              </div>

              <button
                className={styles.downloadAllButton}
                disabled={applicant.documents.length === 0}
                onClick={() => applicant.documents[0] && setPreviewDocument(applicant.documents[0])}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View Uploaded Documents
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.sidebar}>
            {/* Application Timeline */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Application Timeline</h2>

              <div className={styles.timeline}>
                {applicant.timeline.map((item, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineMarker}>
                      <div className={`${styles.timelineDot} ${item.pending ? styles.timelineDotPending : ""}`} />
                      {idx < applicant.timeline.length - 1 && <div className={styles.timelineLine} />}
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={`${styles.timelineEvent} ${item.pending ? styles.timelineEventPending : ""}`}>
                        {item.event}
                      </p>
                      <p className={styles.timelineDate}>{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {applicant.status === "Approved" && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Volunteer QR Code</h2>
                <p className={styles.notesHint}>Generate or review the deployment QR code for this approved volunteer.</p>
                <button
                  onClick={handleGenerateQr}
                  className={styles.notesButton}
                  disabled={qrLoading}
                >
                  {qrLoading ? "Generating..." : "Generate QR Code"}
                </button>
                {qrUrl && (
                  <div style={{ marginTop: "1rem" }}>
                    <img src={qrUrl} alt="Generated volunteer QR code" style={{ width: "100%", maxWidth: 220, height: "auto" }} />
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer" className={styles.documentButton} style={{ marginTop: "0.75rem", display: "inline-flex", textDecoration: "none" }}>
                      Open QR
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Internal Notes */}
            <div className={styles.card}>
              <div className={styles.notesHeader}>
                <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Internal Notes</h2>
                <span className={styles.notesPrivateBadge}>🔒 Private</span>
              </div>
              <p className={styles.notesHint}>These notes are only visible to admins and are not shared with the applicant.</p>

              <div className={styles.notesSection}>
                <textarea
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setIsSaved(false); }}
                  placeholder="Add internal notes about this applicant..."
                  className={styles.notesTextarea}
                  rows={5}
                  disabled={isSaving}
                />

                <button
                  onClick={handleSaveNotes}
                  className={`${styles.notesButton} ${isSaved ? styles.saved : ""}`}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : isSaved ? "✓ Saved" : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
