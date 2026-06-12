'use client';

﻿import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/admin-components/Header";
import Footer from "@/admin-components/Footer";
import styles from "./inventory.module.css";
import { apiFetch } from "@/admin-lib/api";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  site: string;
  location: string;
  date: string;
  time: string;
  quantity: number;
  targetAmount: number;
  currentAmount: number;
  unit: string;
  category: string;
  status: string;
  icon: string;
}

const STATUS_STYLES = {
  active: styles.statusAvailable,
  draft: styles.statusReserved,
  completed: styles.statusDistributed,
  cancelled: styles.statusCancelled,
};

const INVENTORY_STATUS_OPTIONS = ["active", "draft", "completed", "cancelled"];

function getStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getCampaignLocation(row: any) {
  const description = String(row.description ?? "");
  const addressMatch = description.match(/^Address:\s*(.+)$/im);
  const locationMatch = description.match(/^Location:\s*(.+)$/im);
  return row.organizations?.address ?? addressMatch?.[1]?.trim() ?? locationMatch?.[1]?.trim() ?? row.title ?? "No location available";
}

function cleanCampaignDescription(description: string) {
  const text = String(description ?? "")
    .split("\n")
    .filter((line) => !/^(Address|Location|Limit|DAMAYAN Source|DAMAYAN Status|DAMAYAN Created|Volunteer Role Limit Total):/i.test(line.trim()))
    .join(" ")
    .replace(/\s+Limit:\s*.*$/i, "")
    .replace(/\s+DAMAYAN (Status|Created|Source):\s*.*$/i, "")
    .trim();
  return text;
}

function toCsvValue(value: string | number) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function mapCampaignToInventoryItem(row: any): InventoryItem {
  const createdAt = row.created_at ? new Date(row.created_at) : new Date();

  return {
    id: row.id,
    name: row.title ?? row.name ?? "Untitled",
    description: row.description ?? "",
    site: row.organizations?.name ?? "",
    location: getCampaignLocation(row),
    date: createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    quantity: Number(row.current_amount ?? 0),
    targetAmount: Number(row.target_amount ?? 0),
    currentAmount: Number(row.current_amount ?? 0),
    unit: row.type === 'funds' ? 'PHP' : 'Items',
    category: row.type ?? "General",
    status: row.status ?? "draft",
    icon: "📦",
  };
}

// Edit Modal Component
function EditModal({ item, onClose, onSave, isSaving }: { item: any; onClose: () => void; onSave: (updatedItem: any) => void; isSaving: boolean }) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    category: item.category,
    status: item.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...item, ...formData });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalLarge}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Edit Item</h3>
          <button onClick={onClose} className={styles.modalCloseButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Item Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Campaign Type</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Organization</label>
              <input type="text" value={item.site || "No linked organization"} className={styles.formInput} disabled />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Location</label>
              <input type="text" value={item.location || "No location available"} className={styles.formInput} disabled />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={styles.formSelect}
              >
                {INVENTORY_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{getStatusLabel(status)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.modalCancelButton} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className={styles.modalSaveButton} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View Modal Component
function ViewModal({ item, onClose }: { item: any; onClose: () => void }) {
  const statusStyle = STATUS_STYLES[item.status as keyof typeof STATUS_STYLES] || styles.statusAvailable;
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await apiFetch<any[]>(`/donors?campaign_id=${item.id}&status=confirmed`);
        setRecent(res ?? []);
      } catch (e) {
        console.error("Failed to fetch recent activity:", e);
      }
    }
    fetchActivity();
  }, [item.id]);

  const cleanDescription = cleanCampaignDescription(item.description) || "Donation mission inventory and approved received items.";

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalLarge} ${styles.viewModal}`}>
        <div className={styles.modalHeaderClassic}>
          <h2 className={styles.modalHeaderTitle}>Inventory Overview</h2>
          <button onClick={onClose} className={styles.modalCloseButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.modalScrollBody}>
          <div className={styles.viewItemHero}>
            <div className={styles.viewHeroIcon}>{item.icon}</div>
            <div>
               <h3 className={styles.modalItemTitle}>{item.name}</h3>
               <p className={styles.viewSubtitle}>{cleanDescription}</p>
            </div>
          </div>

          <div className={styles.viewSummaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Current Status</span>
            <span className={`${styles.statusBadge} ${statusStyle}`}>
              {getStatusLabel(item.status)}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Quantity on Hand</span>
            <span className={styles.summaryValue}>{item.quantity} {item.unit}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Location</span>
            <span className={styles.summaryValue}>{item.location}</span>
          </div>
        </div>

        <div className={styles.viewSection}>
          <h4 className={styles.viewSectionTitle}>Record Information</h4>
          <div className={styles.viewDetailsGrid}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Date Added</span>
              <span className={styles.detailValue}>{item.date}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Time Logged</span>
              <span className={styles.detailValue}>{item.time}</span>
            </div>
          </div>
        </div>

        <div className={styles.viewSection}>
          <h4 className={styles.viewSectionTitle}>Current Progress</h4>
          <div className={styles.descriptionPanel}>
            <span className={`${styles.statusBadge} ${statusStyle}`}>{getStatusLabel(item.status)}</span>
          </div>
        </div>

        <div className={styles.viewSection}>
          <h4 className={styles.viewSectionTitle}>Recent Activity</h4>
          <div className={styles.descriptionPanel} style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {recent.length === 0 ? (
              <p className={styles.descriptionText}>No recent confirmed goods received yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recent.slice(0, 10).map((act, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
                    <strong>{act.quantity} {act.unit || ""} {act.item_name || "General Goods"}</strong>
                    {" "}donated by{" "}
                    {act.anonymous
                      ? "Anonymous"
                      : [act.user_profiles?.first_name, act.user_profiles?.last_name].filter(Boolean).join(" ") || "Verified Donor"}
                    {act.donated_at ? ` at ${new Date(act.donated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.viewSection}>
          <h4 className={styles.viewSectionTitle}>Description</h4>
          <div className={styles.descriptionPanel}>
            <p className={styles.descriptionText}>{cleanDescription}</p>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.modalCancelButton}>
            Close
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  );
}

function InventoryRow({ 
  item, 
  onView, 
  onEdit
}: { 
  item: InventoryItem; 
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const statusStyle = STATUS_STYLES[item.status as keyof typeof STATUS_STYLES] || styles.statusAvailable;
  
  return (
    <tr className={styles.tableRow}>
      <td className={styles.tableCell}>
        <div className={styles.itemCell}>
          <div className={styles.itemIcon}>{item.icon}</div>
          <div className={styles.itemInfo}>
            <p className={styles.itemName}>{item.name}</p>
            <p className={styles.itemDescription}>{cleanCampaignDescription(item.description)}</p>
          </div>
        </div>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.siteInfo}>
          <p className={styles.siteName}>{item.site}</p>
          <p className={styles.siteLocation}>{item.location}</p>
        </div>
      </td>
      <td className={styles.tableCell}>{item.date}</td>
      <td className={styles.tableCell}>{item.time}</td>
      <td className={styles.tableCell}>{item.currentAmount.toLocaleString()} {item.unit}</td>
      <td className={styles.tableCell}>
        <span className={`${styles.statusBadge} ${statusStyle}`}>{getStatusLabel(item.status)}</span>
      </td>
      <td className={styles.tableCell}>
        <div className={styles.actionCell}>
          <button 
            onClick={() => onView(item.id)} 
            className={`${styles.iconButton} ${styles.viewButton}`} 
            title="View Details"
          >
            <svg className={styles.svg16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button 
            onClick={() => onEdit(item.id)} 
            className={`${styles.iconButton} ${styles.editButton}`} 
            title="Edit Item"
          >
            <svg className={styles.svg16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Inventory() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState("All Sites");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      try {
        const data = await apiFetch<any[]>("/campaigns?type=donation");

        const mapped: InventoryItem[] = (data ?? [])
          .filter((row: any) => 
            String(row.status ?? "").toLowerCase() === "active" && 
            typeof row.description === "string" && 
            row.description.includes("DAMAYAN Source:")
          )
          .map((row: any) => {
          const createdAt = row.created_at ? new Date(row.created_at) : new Date();
          return {
            id: row.id,
            name: row.title ?? row.name ?? "Untitled",
            description: row.description ?? "",
            site: row.organizations?.name ?? "",
            location: getCampaignLocation(row),
            date: createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            time: createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
            quantity: Number(row.current_amount ?? 0),
            targetAmount: Number(row.target_amount ?? 0),
            currentAmount: Number(row.current_amount ?? 0),
            unit: row.type === 'funds' ? 'PHP' : 'Items',
            category: row.type ?? "General",
            status: row.status ?? "draft",
            icon: "📦",
          };
        });

        setInventory(mapped);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
      setLoading(false);
    }
    fetchInventory();
  }, []);

  const sites = useMemo(() => {
    const s = new Set(inventory.map(i => i.location).filter(Boolean));
    return ["All Sites", ...Array.from(s)];
  }, [inventory]);

  const statuses = useMemo(() => {
    const s = new Set(inventory.map(i => i.status).filter(Boolean));
    return ["All Status", ...Array.from(s)];
  }, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSite = selectedSite === "All Sites" || item.location === selectedSite;
      const matchesStatus = selectedStatus === "All Status" || item.status === selectedStatus;
      return matchesSite && matchesStatus;
    });
  }, [inventory, selectedSite, selectedStatus]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: inventory.length,
    available: inventory.filter((i) => i.status === "active").length,
    reserved: inventory.filter((i) => i.status === "draft").length,
    distributed: inventory.filter((i) => i.status === "completed").length,
  };

  const handleSelectAll = () => {
    setSelectedItems(selectedItems.length === paginatedItems.length ? [] : paginatedItems.map((item) => item.id));
  };

  const handleView = (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      setViewingItem(item);
    }
  };

  const handleEdit = (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      setEditingItem(item);
    }
  };

  const handleSaveEdit = async (updatedItem: any) => {
    setSavingEdit(true);
    try {
      await apiFetch(`/campaigns/${updatedItem.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: updatedItem.name,
          description: updatedItem.description,
          type: updatedItem.category,
          target_amount: updatedItem.quantity,
          status: updatedItem.status,
        }),
      });

      setInventory((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)),
      );
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating inventory item:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    const idToDelete = itemToDelete;
    setDeletingId(idToDelete);
    setShowDeleteConfirm(false);

    apiFetch(`/campaigns/${idToDelete}`, { method: "DELETE" })
      .then(() => {
        setInventory((prev) => prev.filter((item) => item.id !== idToDelete));
        setSelectedItems((prev) => prev.filter((id) => id !== idToDelete));
      })
      .catch((err) => {
        console.error("Error deleting inventory item:", err);
      })
      .finally(() => {
        setDeletingId(null);
        setItemToDelete(null);
      });
  };

  const handleBulkDeleteClick = () => {
    if (selectedItems.length > 0) {
      setShowBulkDeleteConfirm(true);
    }
  };

  const handleExport = () => {
    const rows = [
      ["Name", "Description", "Organization", "Location", "Date", "Time", "Quantity", "Unit", "Category", "Status"],
      ...filteredItems.map((item) => [
        item.name,
        cleanCampaignDescription(item.description),
        item.site,
        item.location,
        item.date,
        item.time,
        item.quantity,
        item.unit,
        item.category,
        getStatusLabel(item.status),
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => toCsvValue(value)).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute("download", `inventory-export-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmBulkDelete = () => {
    const idsToDelete = [...selectedItems];
    if (idsToDelete.length === 0) return;

    setShowBulkDeleteConfirm(false);

    Promise.all(idsToDelete.map((id) => apiFetch(`/campaigns/${id}`, { method: "DELETE" })))
      .then(() => {
        setInventory((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
        setSelectedItems([]);
      })
      .catch((err) => {
        console.error("Error deleting selected inventory items:", err);
      });
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setShowBulkDeleteConfirm(false);
    setItemToDelete(null);
  };

  return (
    <div className={styles.container}>
      
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <button type="button" onClick={() => router.back()} className={styles.backButton}>
            <svg className={styles.svg16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className={styles.headerCenter}>
            <div className={styles.headerTitleWrapper}>
              <h1 className={styles.headerTitle}>Review Donation Inventory</h1>
            </div>
          </div>
          <div className={styles.headerSpacer} />
        </div>

        {/* View Modal */}
        {viewingItem && (
          <ViewModal 
            item={viewingItem} 
            onClose={() => setViewingItem(null)} 
          />
        )}

        {/* Edit Modal */}
        {editingItem && (
          <EditModal 
            item={editingItem} 
            onClose={() => setEditingItem(null)} 
            onSave={handleSaveEdit}
            isSaving={savingEdit}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalIcon}>🗑️</div>
              <h3 className={styles.modalTitle}>Delete Item</h3>
              <p className={styles.modalMessage}>Are you sure you want to delete this item? This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button onClick={cancelDelete} className={styles.modalCancelButton}>
                  Cancel
                </button>
                <button onClick={confirmDelete} className={styles.modalConfirmButton}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalIcon}>🗑️</div>
              <h3 className={styles.modalTitle}>Delete Multiple Items</h3>
              <p className={styles.modalMessage}>
                Are you sure you want to delete {selectedItems.length} selected items? This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button onClick={cancelDelete} className={styles.modalCancelButton}>
                  Cancel
                </button>
                <button onClick={confirmBulkDelete} className={styles.modalConfirmButton}>
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Site</label>
              <select value={selectedSite} onChange={(e) => { setSelectedSite(e.target.value); setCurrentPage(1); }} className={styles.filterSelect}>
                {sites.map((site) => <option key={site} value={site}>{site}</option>)}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Date Range</label>
              <input type="text" placeholder="mm/dd/yyyy" className={styles.filterInput} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }} className={styles.filterSelect}>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status === "All Status" ? status : getStatusLabel(status)}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterButtonsGroup}>
              <button className={styles.filterButton} onClick={handleExport}>
                <svg className={styles.svg16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <StatCard label="Total Items" value={stats.total.toString()} />
          <StatCard label="Available" value={stats.available.toString()} />
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Donation Inventory</h2>
            <p className={styles.tableInfo}>
              {selectedItems.length > 0 ? (
                <span className={styles.selectedCount}>{selectedItems.length} selected</span>
              ) : (
                `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredItems.length)} of ${filteredItems.length} items`
              )}
            </p>
          </div>
          {filteredItems.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeadCell}>Items</th>
                    <th className={styles.tableHeadCell}>Sites</th>
                    <th className={styles.tableHeadCell}>Date</th>
                    <th className={styles.tableHeadCell}>Time</th>
                    <th className={styles.tableHeadCell}>Current Donations</th>
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => (
                    <InventoryRow 
                      key={item.id} 
                      item={item} 
                      onView={handleView}
                      onEdit={handleEdit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noResults}>
              <p>No inventory items found matching your criteria.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <p className={styles.paginationInfo}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </p>
            <div className={styles.paginationControls}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={styles.paginationButton}>
                <svg className={styles.svg16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className={styles.paginationPages}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`${styles.pageNumber} ${currentPage === page ? styles.pageNumberActive : ""}`}>
                    {page}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={styles.paginationButton}>
                <svg className={styles.svg16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
