'use client';

﻿import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/admin-components/Header";
import Footer from "@/admin-components/Footer";
import styles from "../volunteers/volunteers.module.css";
import { apiFetch } from "@/admin-lib/api";

interface VolunteerHistoryItem {
  id: string;
  name: string;
  role: string;
  appliedDate: string;
  email: string;
  phone: string;
  status: string;
}

function HistoryItem({ volunteer, onReview }: { volunteer: VolunteerHistoryItem; onReview: (id: string, status: string) => void }) {
  const statusLabel = volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1);
  const statusClass = volunteer.status === "rejected" ? styles.historyBadgeRejected : styles.historyBadgeApproved;

  return (
    <div className={styles.applicationItem}>
      <div className={styles.applicationContent}>
        <div className={styles.applicationInfo}>
          <h3 className={styles.applicationName}>{volunteer.name}</h3>
          <p className={styles.applicationDescription}>{volunteer.role} application was {statusLabel.toLowerCase()}.</p>
          <div className={styles.applicationMeta}>
            <span className={styles.metaItem}>{volunteer.appliedDate}</span>
            <span className={styles.metaItem}>{volunteer.email}</span>
            <span className={styles.metaItem}>{volunteer.phone}</span>
          </div>
        </div>
      </div>
      <div className={styles.applicationActions}>
        <span className={`${styles.historyStatusBadge} ${statusClass}`}>{statusLabel}</span>
        <button onClick={() => onReview(volunteer.id, volunteer.status)} className={styles.reviewButton}>
          Review
        </button>
      </div>
    </div>
  );
}

export default function VolunteerHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<VolunteerHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All Applications");
  const itemsPerPage = 4;

  useEffect(() => {
    const mapApplications = (rows: any[] = []): VolunteerHistoryItem[] => rows.map((row: any) => {
      const profile = row.user_profiles;
      const role = row.volunteer_roles;
      return {
        id: row.id,
        name: profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : "Unknown",
        role: role?.title ?? "General",
        appliedDate: row.applied_at ? new Date(row.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        email: profile?.email ?? "",
        phone: profile?.phone ?? "",
        status: row.status ?? "approved",
      };
    });

    async function fetchHistory() {
      setLoading(true);
      try {
        const [approved, rejected] = await Promise.all([
          apiFetch<any[]>("/applications?status=approved"),
          apiFetch<any[]>("/applications?status=rejected"),
        ]);
        setHistory(mapApplications([...(approved ?? []), ...(rejected ?? [])]));
      } catch (err) {
        console.error("Error fetching volunteer history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const uniqueRoles = useMemo(() => {
    const defaultRoles = ["All Applications", "Medic", "Logistics", "Field"];
    const roles = new Set([...defaultRoles, ...history.map((v) => v.role)]);
    return Array.from(roles);
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchStatus = selectedStatus === "All" || item.status === selectedStatus;
      const matchRole = selectedRole === "All Applications" || item.role === selectedRole || (selectedRole === "Logistics" && item.role === "Logistic");
      return matchStatus && matchRole;
    });
  }, [history, selectedStatus, selectedRole]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedHistory = useMemo(() => filteredHistory.slice(startIndex, startIndex + itemsPerPage), [filteredHistory, startIndex]);

  return (
    <div className={styles.container}>
            <Header />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <Link href='/admin/volunteers' className={styles.backButton}>Back</Link>
          <div className={styles.headerCenter}>
            <div className={styles.headerIcon}>
              <h1 className={styles.headerTitle}>Volunteer History</h1>
            </div>
          </div>
          <Link href='/admin/volunteer-verification' className={styles.backButton}>Verify Volunteers</Link>
        </div>

        <div className={styles.queueSection}>
          <div className={styles.queueHeader}>
            <h2 className={styles.queueTitle}>Historical Application Logs</h2>
            <p className={styles.queueSubtitle}>Review finalized volunteer decisions and verify credentials.</p>
          </div>

          <div className={styles.filterDropdownContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="status-filter" className={styles.filterLabel}>Filter by Status</label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className={styles.selectDropdown}
              >
                <option value="All">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="role-filter" className={styles.filterLabel}>Filter by Application Type / Role</label>
              <select
                id="role-filter"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className={styles.selectDropdown}
              >
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.noApplications}>
            <p className={styles.noApplicationsText}>Loading volunteer history...</p>
          </div>
        ) : (
          <div className={styles.applicationsList}>
            {paginatedHistory.length > 0 ? (
              paginatedHistory.map((volunteer) => (
                <HistoryItem
                  key={volunteer.id}
                  volunteer={volunteer}
                  onReview={(id, status) => {
                    router.push(status === "rejected" ? `/admin/rejected-applicant/${id}` : `/admin/applicant/${id}`);
                  }}
                />
              ))
            ) : (
              <div className={styles.noApplications}>
                <p className={styles.noApplicationsText}>No volunteer history records match the selected filters.</p>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <p className={styles.paginationInfo}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length} history records
            </p>
            <div className={styles.paginationControls}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={styles.paginationButton}>Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={styles.paginationButton}>Next</button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
