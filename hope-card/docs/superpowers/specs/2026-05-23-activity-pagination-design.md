# Design: Recent Activity Pagination

**Date:** 2026-05-23  
**File:** `src/app/(admin)/admin/dashboard/page.tsx`  
**Status:** Approved

---

## Summary

Add server-side pagination to the Recent Activity section on the admin dashboard. Each of the four filter tabs (All, Approvals, Rejections, Donations Sent) independently tracks its own current page and cached results. 7 items are shown per page. Switching tabs does not reset the other tabs' page positions.

---

## 1. State Shape

Replace the current single `activities` state with per-tab state objects:

```ts
// Tracks the current page for each tab independently
const [currentPages, setCurrentPages] = useState<Record<string, number>>({
  All: 1,
  Approvals: 1,
  Rejections: 1,
  "Donations Sent": 1,
});

// Cached results and totals per tab
const [tabData, setTabData] = useState<Record<string, { items: Activity[]; total: number }>>({
  All: { items: [], total: 0 },
  Approvals: { items: [], total: 0 },
  Rejections: { items: [], total: 0 },
  "Donations Sent": { items: [], total: 0 },
});

// Per-tab loading flags
const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({
  All: false,
  Approvals: false,
  Rejections: false,
  "Donations Sent": false,
});
```

The existing `activities` and `loading` states are removed. The `activeFilter` state remains unchanged.

---

## 2. Tab-to-Filter Mapping

| Tab | Query params added to `/api/v1/hopecard/admin/activity` |
|---|---|
| All | `page=N&limit=7` |
| Approvals | `page=N&limit=7&action=APPROVED` |
| Rejections | `page=N&limit=7&action=REJECTED` |
| Donations Sent | `page=N&limit=7&action=SENT` |

---

## 3. Fetch Function

Replace the existing `fetchActivities` function with a single `fetchTabData(tab, page)` function:

```ts
const fetchTabData = async (tab: string, page: number) => {
  setTabLoading(prev => ({ ...prev, [tab]: true }));
  try {
    const backendUrl = await getBackendUrlCached();
    const token = localStorage.getItem('admin_token');

    const actionMap: Record<string, string> = {
      Approvals: "APPROVED",
      Rejections: "REJECTED",
      "Donations Sent": "SENT",
    };
    const actionParam = actionMap[tab] ? `&action=${actionMap[tab]}` : "";
    const url = `${backendUrl}/api/v1/hopecard/admin/activity?page=${page}&limit=7${actionParam}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
      return;
    }

    if (!response.ok) {
      setTabData(prev => ({ ...prev, [tab]: { items: [], total: 0 } }));
      return;
    }

    const activityData = await response.json();
    const formatted = formatActivities(activityData.data || []);

    setTabData(prev => ({
      ...prev,
      [tab]: { items: formatted, total: activityData.total || 0 },
    }));
  } catch {
    setTabData(prev => ({ ...prev, [tab]: { items: [], total: 0 } }));
  } finally {
    setTabLoading(prev => ({ ...prev, [tab]: false }));
  }
};
```

The activity formatting logic (time-ago calculation, action→type mapping) is extracted into a pure `formatActivities(rawItems)` helper so it can be reused across all tabs.

---

## 4. Trigger Points

**On mount:** Fetch the "All" tab at page 1 only (lazy-load other tabs on first visit).

```ts
useEffect(() => {
  fetchDashboardData();
  fetchTabData("All", 1);
}, []);
```

**On tab switch:** Fetch the newly active tab at its current remembered page, only if it has no cached data yet for that page.

```ts
const handleTabChange = (tab: string) => {
  setActiveFilter(tab);
  if (tabData[tab].items.length === 0) {
    fetchTabData(tab, currentPages[tab]);
  }
};
```

**On page change:**

```ts
const handlePageChange = (tab: string, newPage: number) => {
  setCurrentPages(prev => ({ ...prev, [tab]: newPage }));
  fetchTabData(tab, newPage);
};
```

---

## 5. Pagination UI

Rendered below the activity list. Only shown when `total > 7`.

```
[ ← Prev ]   Page 2 of 5   [ Next → ]
```

- **Prev** is disabled when `currentPage === 1` or tab is loading
- **Next** is disabled when `currentPage === lastPage` or tab is loading
- `lastPage = Math.ceil(total / 7)`
- While loading, the activity list renders skeleton rows matching the existing `skeletonText` / `skeletonLabel` CSS classes already used on the stats cards

---

## 6. What Does Not Change

- The `activeFilter` state and filter button rendering are unchanged
- The `dashboardStats` fetch, retry logic, and stats grid are unchanged
- The `Activity` interface, timeline dot, badge, and CSS module are unchanged
- The `ProtectedRoute` wrapper is unchanged

---

## Out of Scope

- Prefetching adjacent pages
- URL-based pagination state (back-button support)
- Infinite scroll
