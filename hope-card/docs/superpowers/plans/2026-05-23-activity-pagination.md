# Activity Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side pagination (7 items per page) to the Recent Activity section on the admin dashboard, with each filter tab independently remembering its current page.

**Architecture:** Extract the activity formatting logic into a pure helper function in `admin-lib`, then replace the single bulk-fetch in `page.tsx` with a per-tab `fetchTabData(tab, page)` function. Add per-tab page state and a Prev/Next pagination UI below the activity list.

**Tech Stack:** Next.js 14, React, TypeScript, CSS Modules

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/admin-lib/format-activities.ts` | **Create** | Pure helper — converts raw API activity rows into display-ready `Activity` objects |
| `tests/unit/format-activities.test.ts` | **Create** | Unit tests for the pure helper |
| `src/app/(admin)/admin/dashboard/page.tsx` | **Modify** | Replace bulk fetch + client-side filter with per-tab server-side pagination |
| `src/app/(admin)/admin/dashboard/page.module.css` | **Modify** | Add pagination control styles |

---

## Task 1: Extract formatActivities helper

**Files:**
- Create: `src/admin-lib/format-activities.ts`
- Create: `tests/unit/format-activities.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/format-activities.test.ts`:

```ts
import { formatActivities } from "../../src/admin-lib/format-activities";

describe("formatActivities", () => {
  const fakeNow = new Date("2026-05-23T12:00:00.000Z").getTime();

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(fakeNow);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns an empty array for empty input", () => {
    expect(formatActivities([])).toEqual([]);
  });

  it("maps APPROVED action to type approval and status Approved", () => {
    const raw = [
      {
        id: "1",
        action: "APPROVED",
        description: "Approved John",
        created_at: new Date(fakeNow - 30 * 60 * 1000).toISOString(), // 30 mins ago
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("approval");
    expect(result[0].status).toBe("Approved");
    expect(result[0].time).toBe("30 minutes ago");
  });

  it("maps REJECTED action to type rejection and status Rejected", () => {
    const raw = [
      {
        id: "2",
        action: "REJECTED",
        description: "Rejected Jane Smith",
        created_at: new Date(fakeNow - 2 * 3600 * 1000).toISOString(), // 2 hours ago
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("rejection");
    expect(result[0].status).toBe("Rejected");
    expect(result[0].time).toBe("2 hours ago");
  });

  it("maps SENT action to type donation and status Sent", () => {
    const raw = [
      {
        id: "3",
        action: "SENT",
        description: "Sent donation",
        created_at: new Date(fakeNow - 3 * 86400 * 1000).toISOString(), // 3 days ago
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("donation");
    expect(result[0].status).toBe("Sent");
    expect(result[0].time).toBe("3 days ago");
  });

  it("maps APPLIED action to type approval and status Applied", () => {
    const raw = [
      {
        id: "4",
        action: "APPLIED",
        description: "Applied for task",
        created_at: new Date(fakeNow - 45 * 1000).toISOString(), // 45 seconds ago
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("approval");
    expect(result[0].status).toBe("Applied");
    expect(result[0].time).toBe("just now");
  });

  it("splits description into action and subject correctly", () => {
    const raw = [
      {
        id: "5",
        action: "APPROVED",
        description: "Approved John Doe",
        created_at: new Date(fakeNow).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].action).toBe("Approved John");
    expect(result[0].subject).toBe("Doe");
  });

  it("uses a fallback id when id is missing", () => {
    const raw = [
      {
        action: "APPROVED",
        description: "Approved someone",
        created_at: new Date(fakeNow).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(typeof result[0].id).toBe("string");
    expect(result[0].id.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card"
npx jest tests/unit/format-activities.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '../../src/admin-lib/format-activities'`

- [ ] **Step 3: Create the helper**

Create `src/admin-lib/format-activities.ts`:

```ts
export interface Activity {
  id: string;
  action: string;
  subject: string;
  time: string;
  type: string;
  status: string;
}

interface RawActivity {
  id?: string;
  action: string;
  description: string;
  created_at: string;
}

export function formatActivities(rawItems: RawActivity[]): Activity[] {
  return rawItems.map((activity) => {
    const createdAt = new Date(activity.created_at);
    const diff = Date.now() - createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    let timeStr = "just now";
    if (minutes >= 60 && hours < 24) {
      timeStr = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (minutes >= 1 && minutes < 60) {
      timeStr = `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (days >= 1) {
      timeStr = `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    let type = "approval";
    let status = activity.action || "Activity";

    if (activity.action === "APPROVED") {
      type = "approval";
      status = "Approved";
    } else if (activity.action === "REJECTED") {
      type = "rejection";
      status = "Rejected";
    } else if (activity.action === "APPLIED") {
      type = "approval";
      status = "Applied";
    } else if (activity.action === "SENT") {
      type = "donation";
      status = "Sent";
    }

    const words = activity.description.split(" ");
    return {
      id: activity.id ?? Math.random().toString(),
      action: words.slice(0, -1).join(" "),
      subject: words.slice(-1)[0] ?? "",
      time: timeStr,
      type,
      status,
    };
  });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest tests/unit/format-activities.test.ts --no-coverage
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" add src/admin-lib/format-activities.ts tests/unit/format-activities.test.ts
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" commit -m "feat: extract formatActivities helper for activity pagination"
```

---

## Task 2: Replace state in page.tsx

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 1: Import the new helper and update the Activity import**

At the top of `page.tsx`, replace the local `Activity` interface and add the import:

```ts
// Remove this block entirely:
// interface Activity {
//   id: string;
//   action: string;
//   subject: string;
//   time: string;
//   type: string;
//   status: string;
// }

// Add this import after the existing imports:
import { formatActivities, Activity } from "@/admin-lib/format-activities";
```

- [ ] **Step 2: Replace the activities/loading state declarations**

Find and remove these state declarations:

```ts
const [activities, setActivities] = useState<Activity[]>([]);
const [loading, setLoading] = useState(true);
```

Replace with:

```ts
const [loading, setLoading] = useState(true);

const TABS = ["All", "Approvals", "Rejections", "Donations Sent"] as const;
type Tab = typeof TABS[number];

const [activeFilter, setActiveFilter] = useState<Tab>("All");

const [currentPages, setCurrentPages] = useState<Record<Tab, number>>({
  All: 1,
  Approvals: 1,
  Rejections: 1,
  "Donations Sent": 1,
});

const [tabData, setTabData] = useState<Record<Tab, { items: Activity[]; total: number }>>({
  All: { items: [], total: 0 },
  Approvals: { items: [], total: 0 },
  Rejections: { items: [], total: 0 },
  "Donations Sent": { items: [], total: 0 },
});

const [tabLoading, setTabLoading] = useState<Record<Tab, boolean>>({
  All: false,
  Approvals: false,
  Rejections: false,
  "Donations Sent": false,
});
```

Also remove the existing `const [activeFilter, setActiveFilter] = useState("All");` line since it's now included above.

- [ ] **Step 3: Verify TypeScript compiles with no errors**

```bash
cd "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card"
npx tsc --noEmit
```

Expected: No errors. If there are errors about `activeFilter` being redeclared, ensure the old `useState("All")` line is removed.

- [ ] **Step 4: Commit**

```bash
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" add src/app/\(admin\)/admin/dashboard/page.tsx
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" commit -m "feat: add per-tab pagination state to dashboard"
```

---

## Task 3: Replace fetchActivities with fetchTabData

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 1: Delete the existing fetchActivities function**

Remove the entire `fetchActivities` async function (lines ~146–230 in the original file) — the full block from `const fetchActivities = async () => {` through its closing `};`.

- [ ] **Step 2: Add the fetchTabData function**

Add this function inside the `Dashboard` component, below the state declarations and above the `useEffect`:

```ts
const ACTION_MAP: Partial<Record<Tab, string>> = {
  Approvals: "APPROVED",
  Rejections: "REJECTED",
  "Donations Sent": "SENT",
};

const ITEMS_PER_PAGE = 7;

const fetchTabData = async (tab: Tab, page: number) => {
  setTabLoading((prev) => ({ ...prev, [tab]: true }));
  try {
    const backendUrl = await getBackendUrlCached();
    const token = localStorage.getItem("admin_token");

    const actionParam = ACTION_MAP[tab] ? `&action=${ACTION_MAP[tab]}` : "";
    const url = `${backendUrl}/api/v1/hopecard/admin/activity?page=${page}&limit=${ITEMS_PER_PAGE}${actionParam}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
      return;
    }

    if (!response.ok) {
      setTabData((prev) => ({ ...prev, [tab]: { items: [], total: 0 } }));
      return;
    }

    const activityData = await response.json();
    const formatted = formatActivities(activityData.data || []);

    setTabData((prev) => ({
      ...prev,
      [tab]: { items: formatted, total: activityData.total || 0 },
    }));
  } catch {
    setTabData((prev) => ({ ...prev, [tab]: { items: [], total: 0 } }));
  } finally {
    setTabLoading((prev) => ({ ...prev, [tab]: false }));
  }
};
```

- [ ] **Step 3: Add the tab and page change handlers**

Add these two handler functions directly below `fetchTabData`:

```ts
const handleTabChange = (tab: Tab) => {
  setActiveFilter(tab);
  if (tabData[tab].items.length === 0) {
    fetchTabData(tab, currentPages[tab]);
  }
};

const handlePageChange = (tab: Tab, newPage: number) => {
  setCurrentPages((prev) => ({ ...prev, [tab]: newPage }));
  fetchTabData(tab, newPage);
};
```

- [ ] **Step 4: Update the useEffect**

Find the existing `useEffect` and replace the `fetchActivities()` call with `fetchTabData("All", 1)`:

```ts
useEffect(() => {
  fetchDashboardData();
  fetchTabData("All", 1);
}, []);
```

Remove any reference to `fetchActivities` — it no longer exists.

- [ ] **Step 5: Verify TypeScript compiles with no errors**

```bash
cd "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card"
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" add src/app/\(admin\)/admin/dashboard/page.tsx
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" commit -m "feat: replace fetchActivities with server-side fetchTabData"
```

---

## Task 4: Update JSX — tabs, activity list, and pagination UI

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

- [ ] **Step 1: Update the filter buttons to use handleTabChange**

Find the filter buttons in the JSX:

```tsx
{filters.map((filter) => (
  <button
    key={filter}
    className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ""}`}
    onClick={() => setActiveFilter(filter)}
  >
    {filter}
  </button>
))}
```

Replace with:

```tsx
{TABS.map((tab) => (
  <button
    key={tab}
    className={`${styles.filterBtn} ${activeFilter === tab ? styles.active : ""}`}
    onClick={() => handleTabChange(tab)}
  >
    {tab}
  </button>
))}
```

Also remove the `const filters = ["All", "Approvals", "Rejections", "Donations Sent"];` line — `TABS` replaces it.

- [ ] **Step 2: Update the activity list to use tabData**

Find the activity list section:

```tsx
<div className={styles.activityList}>
  {filteredActivities.map((activity, index) => (
    ...
  ))}
  {filteredActivities.length === 0 && (
    <p className={styles.noData}>No recent activity found for this filter.</p>
  )}
</div>
```

Replace with:

```tsx
<div className={styles.activityList}>
  {tabLoading[activeFilter] ? (
    Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <div key={i} className={styles.activityItem}>
        <div className={styles.timelineDot} style={{ backgroundColor: "#e0e0e0" }}></div>
        <div className={styles.activityContent}>
          <span className={styles.skeletonLabel} style={{ width: "60px" }}></span>
          <span className={styles.skeletonText} style={{ height: "1rem", marginBottom: 0 }}></span>
          <span className={styles.skeletonLabel} style={{ width: "80px" }}></span>
        </div>
      </div>
    ))
  ) : tabData[activeFilter].items.length === 0 ? (
    <p className={styles.noData}>No recent activity found for this filter.</p>
  ) : (
    tabData[activeFilter].items.map((activity, index) => (
      <div key={activity.id} className={styles.activityItem}>
        <div className={`${styles.timelineDot} ${styles[activity.type]}`}></div>
        <div
          className={`${styles.activityContent} ${
            index !== tabData[activeFilter].items.length - 1 ? styles.hasBorder : ""
          }`}
        >
          <span className={styles.time}>{activity.time}</span>
          <p className={styles.actionText}>
            {activity.action} <strong>{activity.subject}</strong>
          </p>
          <span className={`${styles.badge} ${styles[`badge-${activity.type}`]}`}>
            • {activity.status}
          </span>
        </div>
      </div>
    ))
  )}
</div>
```

- [ ] **Step 3: Remove the now-unused filteredActivities variable**

Find and delete this block entirely:

```ts
const filteredActivities = activities.filter((activity) => {
  if (activeFilter === "All") return true;
  if (activeFilter === "Approvals" && (activity.type === "approval" || activity.type === "applied")) return true;
  if (activeFilter === "Rejections" && activity.type === "rejection") return true;
  if (activeFilter === "Donations Sent" && activity.type === "donation") return true;
  return false;
});
```

- [ ] **Step 4: Add the pagination controls below the activityList div**

Directly after the closing `</div>` of `activityList`, add:

```tsx
{(() => {
  const total = tabData[activeFilter].total;
  const currentPage = currentPages[activeFilter];
  const lastPage = Math.ceil(total / ITEMS_PER_PAGE);
  if (total <= ITEMS_PER_PAGE) return null;
  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        onClick={() => handlePageChange(activeFilter, currentPage - 1)}
        disabled={currentPage === 1 || tabLoading[activeFilter]}
      >
        ← Prev
      </button>
      <span className={styles.pageInfo}>
        Page {currentPage} of {lastPage}
      </span>
      <button
        className={styles.pageBtn}
        onClick={() => handlePageChange(activeFilter, currentPage + 1)}
        disabled={currentPage === lastPage || tabLoading[activeFilter]}
      >
        Next →
      </button>
    </div>
  );
})()}
```

- [ ] **Step 5: Verify TypeScript compiles with no errors**

```bash
cd "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card"
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" add src/app/\(admin\)/admin/dashboard/page.tsx
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" commit -m "feat: update dashboard JSX for per-tab pagination"
```

---

## Task 5: Add pagination CSS

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.module.css`

- [ ] **Step 1: Add pagination styles**

Append the following to the end of `page.module.css`:

```css
/* Pagination Controls */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eaeaea;
}

.pageBtn {
  padding: 0.45rem 1rem;
  border: 1px solid #eaeaea;
  background-color: #fafafa;
  color: #333;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pageBtn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #d1d5db;
}

.pageBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pageInfo {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  min-width: 100px;
  text-align: center;
}

@media (max-width: 640px) {
  .pagination {
    gap: 0.75rem;
  }

  .pageBtn {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }

  .pageInfo {
    font-size: 0.75rem;
    min-width: 80px;
  }
}
```

- [ ] **Step 2: Run the full test suite to confirm nothing is broken**

```bash
cd "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card"
npx jest --no-coverage
```

Expected: All tests pass. The new `format-activities.test.ts` tests all pass.

- [ ] **Step 3: Commit**

```bash
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" add src/app/\(admin\)/admin/dashboard/page.module.css
git -C "C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card" commit -m "feat: add pagination control styles to dashboard"
```

---

## Self-Review Checklist

- [x] **formatActivities extracted** — Task 1
- [x] **Per-tab state shape (currentPages, tabData, tabLoading)** — Task 2
- [x] **Tab-to-action mapping (APPROVED/REJECTED/SENT)** — Task 3
- [x] **fetchTabData replaces fetchActivities** — Task 3
- [x] **Mount fetches "All" tab at page 1 only** — Task 3, Step 4
- [x] **handleTabChange — lazy fetch on first visit** — Task 3, Step 3
- [x] **handlePageChange — always fetches** — Task 3, Step 3
- [x] **Filter buttons updated to use handleTabChange** — Task 4, Step 1
- [x] **Activity list uses tabData[activeFilter].items** — Task 4, Step 2
- [x] **Skeleton loading state during tab fetch** — Task 4, Step 2
- [x] **filteredActivities removed** — Task 4, Step 3
- [x] **Prev/Next buttons with correct disabled logic** — Task 4, Step 4
- [x] **Pagination hidden when total ≤ 7** — Task 4, Step 4
- [x] **Pagination CSS** — Task 5
- [x] **ITEMS_PER_PAGE constant used throughout** — Tasks 3 & 4
- [x] **TABS constant replaces filters array** — Tasks 2 & 4
