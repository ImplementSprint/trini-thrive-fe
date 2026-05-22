# Hopecard Frontend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge all four Hopecard persona frontends (Admin, Digital Donor, Campaign Manager, Beneficiary) into a single Next.js app at `hope-card/` using URL-prefix isolation and route groups.

**Architecture:** Each persona lives under its own Next.js route group `(persona)/` containing a persona-prefix subfolder `persona/` that creates the URL namespace. A single `middleware.ts` guards all protected routes by checking a `persona` cookie. Four completely isolated auth contexts share one Next.js process.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase Auth, jose (JWT), lucide-react, nodemailer

---

## Source Repos (READ ONLY — never modify)

| Persona | Source Root |
|---|---|
| Admin | `C:\Users\arjel\Downloads\ADMIN_WithBackend\` |
| Digital Donor | `C:\Users\arjel\Downloads\sitemanager\apps\frontend\` |
| Campaign Manager | `C:\Users\arjel\Downloads\CampaignManager_v2\` |
| Beneficiary | `C:\Users\arjel\Downloads\Beneficiary_v2\` |

## Target (ALL work goes here)

`C:\Users\arjel\Downloads\TriniThrive_Hopecard\Frontend\trini-thrive-fe\hope-card\`

---

## ENV VAR RENAMING (USER DECISION — mandatory)

`NEXT_PUBLIC_BACKEND_URL` is used differently by three personas and must be renamed:
- **Admin files** → `NEXT_PUBLIC_ADMIN_BACKEND_URL` (port 3011)
- **Campaign Manager files** → `NEXT_PUBLIC_CM_BACKEND_URL` (campaign-service)
- **Beneficiary files** → `NEXT_PUBLIC_BENEFICIARY_BACKEND_URL` (api-gateway :5000)
- **Digital Donor** → `NEXT_PUBLIC_API_GATEWAY_URL` (unchanged — do not touch)

Update every reference in copied files. Also update `.env.example`.

## URL/PATH UPDATE RULES (mandatory for every persona)

After copying any file, update ALL of the following to include the persona prefix:
1. `router.push('/old-path')` → `router.push('/persona/old-path')`
2. `redirect('/old-path')` → `redirect('/persona/old-path')`
3. `<Link href="/old-path">` → `<Link href="/persona/old-path">`
4. `fetch('/api/...')` → `fetch('/persona/api/...')` (internal Next.js API routes only)
5. `fetch('/auth/callback')` → `fetch('/persona/auth/callback')`

Do NOT update fetches to external URLs (http://... or process.env.NEXT_PUBLIC_*).

---

## Task 1: Infrastructure Setup

**Files:**
- Modify: `hope-card/package.json`
- Create: `hope-card/src/app/(admin)/layout.tsx`
- Create: `hope-card/src/app/(donor)/layout.tsx`
- Create: `hope-card/src/app/(campaign-manager)/layout.tsx`
- Create: `hope-card/src/app/(beneficiary)/layout.tsx`
- Create: `hope-card/.env.example`

- [ ] **Step 1: Add missing dependencies to package.json**

  Add to `"dependencies"`:
  ```json
  "@supabase/supabase-js": "^2.103.3",
  "@supabase/ssr": "^0.10.2",
  "jose": "^6.2.2",
  "lucide-react": "^1.8.0",
  "nodemailer": "^8.0.5"
  ```
  Add to `"devDependencies"`:
  ```json
  "@types/nodemailer": "^8.0.0"
  ```
  Never downgrade existing versions.

- [ ] **Step 2: Run npm install**

  ```bash
  cd hope-card && npm install
  ```
  Expected: clean install, no peer dep errors.

- [ ] **Step 3: Create route group placeholder layouts**

  Create `hope-card/src/app/(admin)/layout.tsx`:
  ```tsx
  export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  ```
  Repeat for `(donor)`, `(campaign-manager)`, `(beneficiary)` — identical content with matching export name (`DonorGroupLayout`, `CampaignManagerGroupLayout`, `BeneficiaryGroupLayout`).

  These are temporary shells. Each persona migration (Tasks 3–6) replaces the layout with the real auth context.

- [ ] **Step 4: Create .env.example**

  ```env
  # Supabase (shared project or per-persona — adjust as needed)
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=

  # Admin backend (port 3011)
  NEXT_PUBLIC_ADMIN_BACKEND_URL=http://localhost:3011
  JWT_SECRET=

  # Digital Donor — API gateway (port 5000)
  NEXT_PUBLIC_API_GATEWAY_URL=http://127.0.0.1:5000
  NEXT_PUBLIC_APP_URL=http://localhost:3000

  # Campaign Manager backend (campaign-service)
  NEXT_PUBLIC_CM_BACKEND_URL=http://localhost:3002

  # Beneficiary backend (api-gateway fallback :5000)
  NEXT_PUBLIC_BENEFICIARY_BACKEND_URL=http://localhost:5000

  # Email (shared — used by Admin and Campaign Manager)
  SMTP_HOST=
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=
  SMTP_PASSWORD=
  SMTP_FROM=
  GMAIL_EMAIL=
  GMAIL_APP_PASSWORD=
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add hope-card/package.json hope-card/package-lock.json hope-card/src/app/(admin)/layout.tsx hope-card/src/app/(donor)/layout.tsx hope-card/src/app/(campaign-manager)/layout.tsx hope-card/src/app/(beneficiary)/layout.tsx hope-card/.env.example
  git commit -m "feat(hope-card): infrastructure setup — deps, route groups, env example"
  ```

---

## Task 2: Middleware

**Files:**
- Create: `hope-card/src/middleware.ts`

- [ ] **Step 1: Create middleware.ts**

  ```typescript
  import { NextRequest, NextResponse } from 'next/server';

  const PERSONA_MAP: Record<string, string> = {
    '/admin': 'admin',
    '/donor': 'digital-donor',
    '/campaign-manager': 'campaign-manager',
    '/beneficiary': 'beneficiary',
  };

  const PUBLIC_SUFFIXES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-otp',
    '/auth/callback',
    '/verify',
    '/check-email',
    '/otp',
    '/signup',
    '/create-account',
    '/upload-id',
    '/landing',
  ];

  export function middleware(req: NextRequest) {
    const prefix = Object.keys(PERSONA_MAP).find(p =>
      req.nextUrl.pathname.startsWith(p)
    );
    if (!prefix) return NextResponse.next();
    if (PUBLIC_SUFFIXES.some(s => req.nextUrl.pathname.endsWith(s)))
      return NextResponse.next();

    const stored = req.cookies.get('persona')?.value;
    if (!stored || stored !== PERSONA_MAP[prefix]) {
      return NextResponse.redirect(new URL(`${prefix}/login`, req.url));
    }
    return NextResponse.next();
  }

  export const config = {
    matcher: [
      '/admin/:path*',
      '/donor/:path*',
      '/campaign-manager/:path*',
      '/beneficiary/:path*',
    ],
  };
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add hope-card/src/middleware.ts
  git commit -m "feat(hope-card): add persona-aware auth middleware"
  ```

---

## Task 3: Admin Persona Migration

**Source:** `C:\Users\arjel\Downloads\ADMIN_WithBackend\src\`
**Target prefix:** `hope-card/src/app/(admin)/admin/`
**Shared dirs:** `hope-card/src/admin-lib/`, `hope-card/src/admin-components/`
**Auth strategy:** JWT — decode token, verify `persona === 'admin' && system === 'hopecard'`, then set cookie.
**URL prefix:** `/admin`

### 3A: Copy Shared Directories

- [ ] **Step 1: Copy src/lib/ → hope-card/src/admin-lib/**

  Copy all files from `ADMIN_WithBackend/src/lib/` to `hope-card/src/admin-lib/`.
  Preserve subdirectory structure (e.g., `lib/supabase/` → `admin-lib/supabase/`).

- [ ] **Step 2: Copy src/components/ → hope-card/src/admin-components/**

  Copy all files from `ADMIN_WithBackend/src/components/` to `hope-card/src/admin-components/`.
  Preserve full nested structure.

- [ ] **Step 3: Copy public/ assets → hope-card/public/admin/**

  Copy all files from `ADMIN_WithBackend/public/` to `hope-card/public/admin/`.

- [ ] **Step 4: Update internal imports in admin-lib/ and admin-components/**

  In every file under `hope-card/src/admin-lib/` and `hope-card/src/admin-components/`:
  - Replace `from "@/lib/` → `from "@/admin-lib/`
  - Replace `from "@/components/` → `from "@/admin-components/`
  - Replace `from "../lib/` → `from "@/admin-lib/`
  - Replace `from "../components/` → `from "@/admin-components/`
  - Replace `from "../../lib/` → `from "@/admin-lib/`
  - Replace `from "../../components/` → `from "@/admin-components/`
  
  Also rename BACKEND_URL references:
  - Replace `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_ADMIN_BACKEND_URL` everywhere in admin-lib/

### 3B: Copy Pages and API Routes

- [ ] **Step 5: Create directory structure**

  Create all necessary directories under `hope-card/src/app/(admin)/admin/`:
  ```
  admin/
    api/
      health/
      auth/login/ auth/logout/ auth/send-otp/ auth/verify-otp/
      auth/verify-session/ auth/change-password/
      beneficiaries/ beneficiaries/[id]/
      approvals/beneficiaries/ approvals/beneficiaries/bank/
      approvals/beneficiaries/documents/
      approvals/beneficiaries/[id]/[action]/
      approvals/beneficiaries/[id]/bank/[action]/
      approvals/beneficiaries/[id]/documents/[action]/
      approvals/beneficiaries/[id]/donate/
      approvals/digital-donors/ approvals/digital-donors/[id]/[action]/
      approvals/campaign-managers/ approvals/campaign-managers/[id]/[action]/
    auth/callback/
    beneficiaries-approval/ beneficiary-bank-approval/
    beneficiary-documents-approval/ beneficiaries-list/
    campaign-managers/ change-password/ dashboard/
    digital-donors/ forgot-password/ login/ verify/
  ```

- [ ] **Step 6: Copy all page.tsx files**

  For each mapping below, copy the source file to the target:

  | Source | Target |
  |---|---|
  | `src/app/page.tsx` | `(admin)/admin/page.tsx` |
  | `src/app/login/page.tsx` | `(admin)/admin/login/page.tsx` |
  | `src/app/auth/callback/page.tsx` | `(admin)/admin/auth/callback/page.tsx` |
  | `src/app/verify/page.tsx` | `(admin)/admin/verify/page.tsx` |
  | `src/app/forgot-password/page.tsx` | `(admin)/admin/forgot-password/page.tsx` |
  | `src/app/change-password/page.tsx` | `(admin)/admin/change-password/page.tsx` |
  | `src/app/dashboard/page.tsx` | `(admin)/admin/dashboard/page.tsx` |
  | `src/app/beneficiaries-approval/page.tsx` | `(admin)/admin/beneficiaries-approval/page.tsx` |
  | `src/app/beneficiary-bank-approval/page.tsx` | `(admin)/admin/beneficiary-bank-approval/page.tsx` |
  | `src/app/beneficiary-documents-approval/page.tsx` | `(admin)/admin/beneficiary-documents-approval/page.tsx` |
  | `src/app/beneficiaries-list/page.tsx` | `(admin)/admin/beneficiaries-list/page.tsx` |
  | `src/app/digital-donors/page.tsx` | `(admin)/admin/digital-donors/page.tsx` |
  | `src/app/campaign-managers/page.tsx` | `(admin)/admin/campaign-managers/page.tsx` |

- [ ] **Step 7: Copy all route.ts files**

  Copy each source `route.ts` to its target path under `(admin)/admin/`:
  - `src/app/api/health/route.ts` → `(admin)/admin/api/health/route.ts`
  - `src/app/api/auth/login/route.ts` → `(admin)/admin/api/auth/login/route.ts`
  - `src/app/api/auth/logout/route.ts` → `(admin)/admin/api/auth/logout/route.ts`
  - `src/app/api/auth/send-otp/route.ts` → `(admin)/admin/api/auth/send-otp/route.ts`
  - `src/app/api/auth/verify-otp/route.ts` → `(admin)/admin/api/auth/verify-otp/route.ts`
  - `src/app/api/auth/verify-session/route.ts` → `(admin)/admin/api/auth/verify-session/route.ts`
  - `src/app/api/auth/change-password/route.ts` → `(admin)/admin/api/auth/change-password/route.ts`
  - `src/app/api/beneficiaries/route.ts` → `(admin)/admin/api/beneficiaries/route.ts`
  - `src/app/api/beneficiaries/[id]/route.ts` → `(admin)/admin/api/beneficiaries/[id]/route.ts`
  - `src/app/api/approvals/beneficiaries/route.ts` → `(admin)/admin/api/approvals/beneficiaries/route.ts`
  - `src/app/api/approvals/beneficiaries/bank/route.ts` → `(admin)/admin/api/approvals/beneficiaries/bank/route.ts`
  - `src/app/api/approvals/beneficiaries/documents/route.ts` → `(admin)/admin/api/approvals/beneficiaries/documents/route.ts`
  - `src/app/api/approvals/beneficiaries/[id]/[action]/route.ts` → `(admin)/admin/api/approvals/beneficiaries/[id]/[action]/route.ts`
  - `src/app/api/approvals/beneficiaries/[id]/bank/[action]/route.ts` → `(admin)/admin/api/approvals/beneficiaries/[id]/bank/[action]/route.ts`
  - `src/app/api/approvals/beneficiaries/[id]/documents/[action]/route.ts` → `(admin)/admin/api/approvals/beneficiaries/[id]/documents/[action]/route.ts`
  - `src/app/api/approvals/beneficiaries/[id]/donate/route.ts` → `(admin)/admin/api/approvals/beneficiaries/[id]/donate/route.ts`
  - `src/app/api/approvals/digital-donors/route.ts` → `(admin)/admin/api/approvals/digital-donors/route.ts`
  - `src/app/api/approvals/digital-donors/[id]/[action]/route.ts` → `(admin)/admin/api/approvals/digital-donors/[id]/[action]/route.ts`
  - `src/app/api/approvals/campaign-managers/route.ts` → `(admin)/admin/api/approvals/campaign-managers/route.ts`
  - `src/app/api/approvals/campaign-managers/[id]/[action]/route.ts` → `(admin)/admin/api/approvals/campaign-managers/[id]/[action]/route.ts`

- [ ] **Step 8: Copy src/app/tableStyles.module.css if present**

  If `ADMIN_WithBackend/src/app/tableStyles.module.css` exists, copy to `hope-card/src/app/(admin)/admin/tableStyles.module.css`.

### 3C: Update All References in Copied Files

- [ ] **Step 9: Update import paths in all copied page/route files**

  In every file under `(admin)/admin/`:
  - `from "@/lib/` → `from "@/admin-lib/`
  - `from "@/components/` → `from "@/admin-components/`
  - `from "../lib/` and `from "../../lib/` etc → `from "@/admin-lib/`
  - `from "../components/` and `from "../../components/` etc → `from "@/admin-components/`
  - `from "../tableStyles.module.css"` → `from "../tableStyles.module.css"` (relative path OK if CSS is in same subtree)
  - `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_ADMIN_BACKEND_URL`

- [ ] **Step 10: Update navigation and fetch paths**

  In every file under `(admin)/admin/`:
  - `router.push('/dashboard')` → `router.push('/admin/dashboard')`
  - `router.push('/login')` → `router.push('/admin/login')`
  - `redirect('/dashboard')` → `redirect('/admin/dashboard')`
  - `<Link href="/dashboard">` → `<Link href="/admin/dashboard">`
  - `fetch('/api/` → `fetch('/admin/api/`
  - `fetch('/auth/callback')` → `fetch('/admin/auth/callback')`
  - Any `href="/login"` → `href="/admin/login"`
  
  Apply to ALL pages and route handlers. Use grep to find every occurrence:
  ```bash
  grep -rn "router\.push\|redirect(\|href=\"/\|fetch('/api\|fetch('/auth" hope-card/src/app/\(admin\)/
  ```

- [ ] **Step 11: Update static asset paths**

  In every file under `(admin)/admin/`:
  - `/HopeCard Logo.png` → `/admin/HopeCard Logo.png`
  - `/backend-info.json` → `/admin/backend-info.json`
  - Any other `/public/...` style paths → prepend `/admin`

### 3D: Create Admin Layout with Auth Context

- [ ] **Step 12: Replace (admin)/layout.tsx with real auth layout**

  Read `ADMIN_WithBackend/src/app/layout.tsx` for context, then write
  `hope-card/src/app/(admin)/layout.tsx`:

  ```tsx
  import type { Metadata } from 'next';
  import '../app/globals.css';

  export const metadata: Metadata = {
    title: 'HopeCard Admin',
    description: 'HopeCard Administration Portal',
  };

  export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  ```

  Note: This layout intentionally has no auth context wrapper. Admin auth is handled
  per-page via the ProtectedRoute component that already exists in admin-components/.
  The persona cookie is set by the login page (Step 13).

### 3E: Auth Cookie Logic

- [ ] **Step 13: Update admin login page for persona cookie**

  In `hope-card/src/app/(admin)/admin/login/page.tsx`:

  After the successful login API call that returns a JWT:
  ```typescript
  // Decode JWT (jose) and verify admin claims
  import { decodeJwt } from 'jose';

  // After receiving jwt from /admin/api/auth/login:
  const claims = decodeJwt(jwt);
  if (claims.persona !== 'admin' || claims.system !== 'hopecard') {
    // Mismatch — clear token, stay on login
    localStorage.removeItem('token'); // or however the token is stored
    setError('Invalid admin credentials');
    return;
  }
  // Set persona cookie
  document.cookie = 'persona=admin; path=/; SameSite=Strict';
  router.push('/admin/dashboard');
  ```

  Also add mount-time stale cookie check at top of component:
  ```typescript
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'admin') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);
  ```

### 3F: Logout

- [ ] **Step 14: Update every admin logout handler**

  Find all logout functions/buttons in admin pages and admin-components:
  ```bash
  grep -rn "logout\|signOut\|handleLogout" hope-card/src/app/\(admin\)/ hope-card/src/admin-components/
  ```

  Each logout must follow this exact order:
  ```typescript
  // 1. Clear auth token
  await fetch('/admin/api/auth/logout', { method: 'POST' });
  localStorage.removeItem('token'); // if stored in localStorage
  // 2. Expire persona cookie
  document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
  // 3. Redirect (only after both above complete)
  router.push('/admin/login');
  ```

- [ ] **Step 15: Commit admin migration**

  ```bash
  git add hope-card/src/app/\(admin\)/ hope-card/src/admin-lib/ hope-card/src/admin-components/ hope-card/public/admin/
  git commit -m "feat(hope-card): migrate Admin persona to /admin/* prefix"
  ```

---

## Task 4: Digital Donor Persona Migration

**Source:** `C:\Users\arjel\Downloads\sitemanager\apps\frontend\`
**Target prefix:** `hope-card/src/app/(donor)/donor/`
**Shared dirs:** `hope-card/src/donor-lib/`, `hope-card/src/donor-components/`, `hope-card/src/donor-hooks/`, `hope-card/src/donor-contexts/`
**Auth strategy:** Supabase session — set `persona=digital-donor` cookie directly after `supabase.auth` succeeds.
**URL prefix:** `/donor`
**Note:** Digital Donor already uses internal route group `(auth)/` — preserve it inside the `/donor/` prefix.

### 4A: Copy Shared Directories

- [ ] **Step 1: Copy lib/ → hope-card/src/donor-lib/**
  Source: `sitemanager/apps/frontend/lib/`
  Copy all files (supabase-client.ts, hopecard-session.ts, hopecard-supabase.ts, storage-url.ts).

- [ ] **Step 2: Copy components/ → hope-card/src/donor-components/**
  Source: `sitemanager/apps/frontend/components/`
  Copy all files (auth-shared.tsx, CustomInput.tsx, DonationModal.tsx, GradientButton.tsx, SharedLayout.tsx, ShareModal.tsx).

- [ ] **Step 3: Copy hooks/ → hope-card/src/donor-hooks/**
  Source: `sitemanager/apps/frontend/hooks/`
  Copy useCampaigns.ts, useImpact.ts, useProfile.ts.

- [ ] **Step 4: Copy contexts/ → hope-card/src/donor-contexts/**
  Source: `sitemanager/apps/frontend/contexts/`
  Copy CartContext.tsx and any other context files.

- [ ] **Step 5: Copy public/ → hope-card/public/donor/**
  Source: `sitemanager/apps/frontend/public/`
  Copy all image files.

- [ ] **Step 6: Update internal imports in shared dirs**

  In donor-lib/, donor-components/, donor-hooks/, donor-contexts/:
  - `from "@/lib/` → `from "@/donor-lib/`
  - `from "@/components/` → `from "@/donor-components/`
  - `from "@/hooks/` → `from "@/donor-hooks/`
  - `from "@/contexts/` → `from "@/donor-contexts/`
  - Relative `../lib/`, `../components/`, `../hooks/`, `../contexts/` → use `@/donor-*` equivalents
  - Remove localhost fallbacks: replace `|| 'http://localhost:3000'` and `|| 'http://127.0.0.1:5000'` with empty string (env vars only)

### 4B: Copy Pages and API Routes

- [ ] **Step 7: Copy app/ structure**

  Copy all page.tsx, layout.tsx, and route.ts files from `sitemanager/apps/frontend/app/` preserving the internal `(auth)/` route group:

  | Source | Target |
  |---|---|
  | `app/page.tsx` | `(donor)/donor/page.tsx` |
  | `app/layout.tsx` | `(donor)/layout.tsx` (becomes the group layout) |
  | `app/(auth)/layout.tsx` | `(donor)/donor/(auth)/layout.tsx` |
  | `app/(auth)/check-email/page.tsx` | `(donor)/donor/(auth)/check-email/page.tsx` |
  | `app/(auth)/forgot-password/page.tsx` | `(donor)/donor/(auth)/forgot-password/page.tsx` |
  | `app/(auth)/login/page.tsx` | `(donor)/donor/(auth)/login/page.tsx` |
  | `app/(auth)/otp/page.tsx` | `(donor)/donor/(auth)/otp/page.tsx` |
  | `app/(auth)/reset-password/page.tsx` | `(donor)/donor/(auth)/reset-password/page.tsx` |
  | `app/(auth)/signup/page.tsx` | `(donor)/donor/(auth)/signup/page.tsx` |
  | `app/(auth)/upload-id/page.tsx` | `(donor)/donor/(auth)/upload-id/page.tsx` |
  | `app/basket/page.tsx` | `(donor)/donor/basket/page.tsx` |
  | `app/donation/page.tsx` | `(donor)/donor/donation/page.tsx` |
  | `app/explore/page.tsx` | `(donor)/donor/explore/page.tsx` |
  | `app/home/page.tsx` | `(donor)/donor/home/page.tsx` |
  | `app/landing/page.tsx` | `(donor)/donor/landing/page.tsx` |
  | `app/payment/page.tsx` | `(donor)/donor/payment/page.tsx` |
  | `app/payment/success/page.tsx` | `(donor)/donor/payment/success/page.tsx` |
  | `app/profile/page.tsx` | `(donor)/donor/profile/page.tsx` |
  | `app/settings/page.tsx` | `(donor)/donor/settings/page.tsx` |
  | `app/stories/page.tsx` | `(donor)/donor/stories/page.tsx` |
  | `app/transactions/page.tsx` | `(donor)/donor/transactions/page.tsx` |
  | `app/api/global-stats/route.ts` | `(donor)/donor/api/global-stats/route.ts` |
  | `app/auth/callback/route.ts` | `(donor)/donor/auth/callback/route.ts` |

### 4C: Update All References in Copied Files

- [ ] **Step 8: Update import paths**

  In every file under `(donor)/donor/` and `(donor)/layout.tsx`:
  - `from "@/lib/` → `from "@/donor-lib/`
  - `from "@/components/` → `from "@/donor-components/`
  - `from "@/hooks/` → `from "@/donor-hooks/`
  - `from "@/contexts/` → `from "@/donor-contexts/`
  - Fix relative `../../../components/` (from (auth) pages 3 levels deep) → `from "@/donor-components/`
  - Fix relative `../../../contexts/` → `from "@/donor-contexts/`
  - Fix relative `../../../hooks/` → `from "@/donor-hooks/`

- [ ] **Step 9: Update navigation and fetch paths**

  All routes and links get `/donor` prefix:
  - `/login` → `/donor/login`
  - `/home` → `/donor/home`
  - `/explore` → `/donor/explore`
  - `/basket` → `/donor/basket`
  - `/donate` / `/donation` → `/donor/donation`
  - `/payment` → `/donor/payment`
  - `/profile` → `/donor/profile`
  - `/settings` → `/donor/settings`
  - `/stories` → `/donor/stories`
  - `/transactions` → `/donor/transactions`
  - `/auth/callback` → `/donor/auth/callback`
  - `fetch('/api/global-stats')` → `fetch('/donor/api/global-stats')`
  - Remove localhost fallbacks from all fetch calls

- [ ] **Step 10: Update static asset paths**

  - `/logo_h.png` → `/donor/logo_h.png`
  - `/img.png`, `/img_1.png` etc → `/donor/img.png`, `/donor/img_1.png`

### 4D: Donor Layout with Auth Context

- [ ] **Step 11: Replace (donor)/layout.tsx**

  The source `app/layout.tsx` becomes `(donor)/layout.tsx`.
  Wrap children in whatever providers the Donor app uses (Supabase session provider, cart context, etc.).
  Update all provider import paths to use `@/donor-*` aliases.

### 4E: Auth Cookie Logic

- [ ] **Step 12: Update donor login page**

  In `(donor)/donor/(auth)/login/page.tsx`:

  After successful Supabase auth:
  ```typescript
  // After supabase.auth.signInWithPassword() or OAuth callback succeeds:
  document.cookie = 'persona=digital-donor; path=/; SameSite=Strict';
  router.push('/donor/home');
  ```

  Mount-time stale cookie check:
  ```typescript
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'digital-donor') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);
  ```

  Also update the auth callback route (`(donor)/donor/auth/callback/route.ts`) to set persona cookie via response headers:
  ```typescript
  response.cookies.set('persona', 'digital-donor', { path: '/', sameSite: 'strict' });
  ```

### 4F: Logout

- [ ] **Step 13: Update all donor logout handlers**

  ```typescript
  // 1. Sign out from Supabase
  await supabase.auth.signOut();
  // 2. Expire persona cookie
  document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
  // 3. Redirect
  router.push('/donor/login');
  ```

- [ ] **Step 14: Commit donor migration**

  ```bash
  git add hope-card/src/app/\(donor\)/ hope-card/src/donor-lib/ hope-card/src/donor-components/ hope-card/src/donor-hooks/ hope-card/src/donor-contexts/ hope-card/public/donor/
  git commit -m "feat(hope-card): migrate Digital Donor persona to /donor/* prefix"
  ```

---

## Task 5: Campaign Manager Persona Migration

**Source:** `C:\Users\arjel\Downloads\CampaignManager_v2\`
**Target prefix:** `hope-card/src/app/(campaign-manager)/campaign-manager/`
**Shared dirs:** `hope-card/src/campaign-manager-components/`, `hope-card/src/campaign-manager-utils/`, `hope-card/src/campaign-manager-types/`
**Auth strategy:** Supabase session — set `persona=campaign-manager` cookie directly after Supabase auth.
**URL prefix:** `/campaign-manager`
**ENV rename:** `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_CM_BACKEND_URL`

### 5A: Copy Shared Directories

- [ ] **Step 1: Copy components/ → hope-card/src/campaign-manager-components/**
  Source: `CampaignManager_v2/components/`
  Copy AdminApprovalModal.tsx, AppShell.tsx, AuthShell.tsx, CampaignCard.tsx, CreateCampaignModal.tsx, SectionPlaceholder.tsx.

- [ ] **Step 2: Copy utils/ → hope-card/src/campaign-manager-utils/**
  Source: `CampaignManager_v2/utils/`
  Copy supabase/ subdirectory (server.ts, client.ts, admin.ts).

- [ ] **Step 3: Copy types/ → hope-card/src/campaign-manager-types/**
  Source: `CampaignManager_v2/types/`
  Copy campaign.ts.

- [ ] **Step 4: Copy public/ → hope-card/public/campaign-manager/**
  Source: `CampaignManager_v2/public/`
  Copy all files including images/ subdirectory.

- [ ] **Step 5: Update imports in shared dirs**

  In campaign-manager-components/, campaign-manager-utils/, campaign-manager-types/:
  - `from "@/components/` → `from "@/campaign-manager-components/`
  - `from "@/utils/` → `from "@/campaign-manager-utils/`
  - `from "@/types/` → `from "@/campaign-manager-types/`
  - `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_CM_BACKEND_URL`

### 5B: Copy Pages and API Routes

- [ ] **Step 6: Copy app/ structure**

  Also copy `app/actions/` directory (auth.ts, campaign.ts — server actions used by pages).

  | Source | Target |
  |---|---|
  | `app/page.tsx` | `(campaign-manager)/campaign-manager/page.tsx` |
  | `app/layout.tsx` | `(campaign-manager)/layout.tsx` |
  | `app/campaign/[id]/page.tsx` | `(campaign-manager)/campaign-manager/campaign/[id]/page.tsx` |
  | `app/create-account/page.tsx` | `(campaign-manager)/campaign-manager/create-account/page.tsx` |
  | `app/create-campaign/page.tsx` | `(campaign-manager)/campaign-manager/create-campaign/page.tsx` |
  | `app/dashboard/page.tsx` | `(campaign-manager)/campaign-manager/dashboard/page.tsx` |
  | `app/donors/page.tsx` | `(campaign-manager)/campaign-manager/donors/page.tsx` |
  | `app/forgot-password/page.tsx` | `(campaign-manager)/campaign-manager/forgot-password/page.tsx` |
  | `app/my-campaigns/page.tsx` | `(campaign-manager)/campaign-manager/my-campaigns/page.tsx` |
  | `app/otp/page.tsx` | `(campaign-manager)/campaign-manager/otp/page.tsx` |
  | `app/reports/page.tsx` | `(campaign-manager)/campaign-manager/reports/page.tsx` |
  | `app/reset-password/page.tsx` | `(campaign-manager)/campaign-manager/reset-password/page.tsx` |
  | `app/settings/page.tsx` | `(campaign-manager)/campaign-manager/settings/page.tsx` |
  | `app/auth/callback/route.ts` | `(campaign-manager)/campaign-manager/auth/callback/route.ts` |
  | `app/actions/auth.ts` | `(campaign-manager)/campaign-manager/actions/auth.ts` |
  | `app/actions/campaign.ts` | `(campaign-manager)/campaign-manager/actions/campaign.ts` |

  Also check for any `*-ui.tsx` co-located files alongside page.tsx and copy those too.

### 5C: Update All References

- [ ] **Step 7: Update import paths**

  In every file under `(campaign-manager)/campaign-manager/`:
  - `from "@/components/` → `from "@/campaign-manager-components/`
  - `from "@/utils/` → `from "@/campaign-manager-utils/`
  - `from "@/types/` → `from "@/campaign-manager-types/`
  - `from "../../components/` → `from "@/campaign-manager-components/`
  - `from "../../utils/` → `from "@/campaign-manager-utils/`
  - `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_CM_BACKEND_URL`

- [ ] **Step 8: Update navigation and fetch paths**

  - `/dashboard` → `/campaign-manager/dashboard`
  - `/create-account` → `/campaign-manager/create-account`
  - `/create-campaign` → `/campaign-manager/create-campaign`
  - `/my-campaigns` → `/campaign-manager/my-campaigns`
  - `/campaign/` → `/campaign-manager/campaign/`
  - `/donors` → `/campaign-manager/donors`
  - `/reports` → `/campaign-manager/reports`
  - `/settings` → `/campaign-manager/settings`
  - `/forgot-password` → `/campaign-manager/forgot-password`
  - `/otp` → `/campaign-manager/otp`
  - `/reset-password` → `/campaign-manager/reset-password`
  - `/auth/callback` → `/campaign-manager/auth/callback`
  - In server actions: update `NEXT_PUBLIC_APP_URL` usage to ensure callback URLs point to `/campaign-manager/auth/callback`

- [ ] **Step 9: Update static asset paths**

  - `/images/logo_h.png` → `/campaign-manager/images/logo_h.png`
  - `/images/background.jpg` → `/campaign-manager/images/background.jpg`

### 5D: Auth Cookie Logic

- [ ] **Step 10: Update campaign manager login/create-account pages**

  In `create-account/page.tsx` and wherever login/auth completes:
  ```typescript
  // After successful Supabase auth:
  document.cookie = 'persona=campaign-manager; path=/; SameSite=Strict';
  router.push('/campaign-manager/dashboard');
  ```

  Mount-time stale cookie check on login/create-account pages:
  ```typescript
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'campaign-manager') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);
  ```

  In auth callback route:
  ```typescript
  response.cookies.set('persona', 'campaign-manager', { path: '/', sameSite: 'strict' });
  ```

### 5E: Logout

- [ ] **Step 11: Update all CM logout handlers**

  ```typescript
  await supabase.auth.signOut();
  document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
  router.push('/campaign-manager/create-account'); // or /campaign-manager/forgot-password — wherever login lives
  ```

  Note: CM uses `/create-account` as its registration/login entry point.

- [ ] **Step 12: Commit CM migration**

  ```bash
  git add hope-card/src/app/\(campaign-manager\)/ hope-card/src/campaign-manager-components/ hope-card/src/campaign-manager-utils/ hope-card/src/campaign-manager-types/ hope-card/public/campaign-manager/
  git commit -m "feat(hope-card): migrate Campaign Manager persona to /campaign-manager/* prefix"
  ```

---

## Task 6: Beneficiary Persona Migration

**Source:** `C:\Users\arjel\Downloads\Beneficiary_v2\`
**Target prefix:** `hope-card/src/app/(beneficiary)/beneficiary/`
**Shared dirs:** `hope-card/src/beneficiary-lib/`, `hope-card/src/beneficiary-components/`, `hope-card/src/beneficiary-utils/`
**Auth strategy:** Supabase session — set `persona=beneficiary` cookie after Supabase auth.
**URL prefix:** `/beneficiary`
**ENV rename:** `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_BENEFICIARY_BACKEND_URL`
**Important:** Beneficiary has its own `utils/supabase/middleware.ts` — do NOT merge into hope-card middleware. Copy to `beneficiary-utils/supabase/middleware.ts` and leave unused (beneficiary auth is handled by hope-card middleware.ts).

### 6A: Copy Shared Directories

- [ ] **Step 1: Copy lib/ → hope-card/src/beneficiary-lib/**
  Source: `Beneficiary_v2/lib/`
  Copy reference-number.ts.

- [ ] **Step 2: Copy app/components/ → hope-card/src/beneficiary-components/**
  Source: `Beneficiary_v2/app/components/`
  Copy DashboardLayout.tsx.

- [ ] **Step 3: Copy utils/ → hope-card/src/beneficiary-utils/**
  Source: `Beneficiary_v2/utils/`
  Copy supabase/ subdirectory (server.ts, client.ts, middleware.ts).
  The middleware.ts here is the beneficiary's own standalone middleware — copy it but do NOT register it anywhere in hope-card. It is inert.

- [ ] **Step 4: Copy public/ → hope-card/public/beneficiary/**
  Source: `Beneficiary_v2/public/`
  Copy all files including images/ subdirectory.

- [ ] **Step 5: Update imports in shared dirs**

  In beneficiary-lib/, beneficiary-components/, beneficiary-utils/:
  - `from "@/lib/` → `from "@/beneficiary-lib/`
  - `from "@/utils/` → `from "@/beneficiary-utils/`
  - `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_BENEFICIARY_BACKEND_URL`

### 6B: Copy Pages and API Routes

- [ ] **Step 6: Copy app/ structure**

  | Source | Target |
  |---|---|
  | `app/page.tsx` | `(beneficiary)/beneficiary/page.tsx` |
  | `app/layout.tsx` | `(beneficiary)/layout.tsx` |
  | `app/banking-details/page.tsx` | `(beneficiary)/beneficiary/banking-details/page.tsx` |
  | `app/campaigns/page.tsx` | `(beneficiary)/beneficiary/campaigns/page.tsx` |
  | `app/campaigns/[id]/page.tsx` | `(beneficiary)/beneficiary/campaigns/[id]/page.tsx` |
  | `app/campaigns/invitation-accepted/page.tsx` | `(beneficiary)/beneficiary/campaigns/invitation-accepted/page.tsx` |
  | `app/campaigns/invitations/page.tsx` | `(beneficiary)/beneficiary/campaigns/invitations/page.tsx` |
  | `app/connect-bank/page.tsx` | `(beneficiary)/beneficiary/connect-bank/page.tsx` |
  | `app/dashboard/page.tsx` | `(beneficiary)/beneficiary/dashboard/page.tsx` |
  | `app/fund-management/page.tsx` | `(beneficiary)/beneficiary/fund-management/page.tsx` |
  | `app/identity-verification/page.tsx` | `(beneficiary)/beneficiary/identity-verification/page.tsx` |
  | `app/login/page.tsx` | `(beneficiary)/beneficiary/login/page.tsx` |
  | `app/otp/page.tsx` | `(beneficiary)/beneficiary/otp/page.tsx` |
  | `app/profile-settings/page.tsx` | `(beneficiary)/beneficiary/profile-settings/page.tsx` |
  | `app/request-withdrawal/page.tsx` | `(beneficiary)/beneficiary/request-withdrawal/page.tsx` |
  | `app/security-settings/page.tsx` | `(beneficiary)/beneficiary/security-settings/page.tsx` |
  | `app/signup/page.tsx` | `(beneficiary)/beneficiary/signup/page.tsx` |
  | `app/api/auth/login/route.ts` | `(beneficiary)/beneficiary/api/auth/login/route.ts` |
  | `app/api/auth/signup/route.ts` | `(beneficiary)/beneficiary/api/auth/signup/route.ts` |
  | `app/api/bank-accounts/route.ts` | `(beneficiary)/beneficiary/api/bank-accounts/route.ts` |
  | `app/api/bank-accounts/[id]/route.ts` | `(beneficiary)/beneficiary/api/bank-accounts/[id]/route.ts` |
  | `app/api/campaigns/route.ts` | `(beneficiary)/beneficiary/api/campaigns/route.ts` |
  | `app/api/campaigns/[id]/route.ts` | `(beneficiary)/beneficiary/api/campaigns/[id]/route.ts` |
  | `app/api/campaigns/invitations/route.ts` | `(beneficiary)/beneficiary/api/campaigns/invitations/route.ts` |
  | `app/api/campaigns/invitations/[id]/accept/route.ts` | `(beneficiary)/beneficiary/api/campaigns/invitations/[id]/accept/route.ts` |
  | `app/api/campaigns/invitations/[id]/decline/route.ts` | `(beneficiary)/beneficiary/api/campaigns/invitations/[id]/decline/route.ts` |
  | `app/api/identity-documents/route.ts` | `(beneficiary)/beneficiary/api/identity-documents/route.ts` |
  | `app/api/identity-documents/signed-url/route.ts` | `(beneficiary)/beneficiary/api/identity-documents/signed-url/route.ts` |
  | `app/api/withdrawals/route.ts` | `(beneficiary)/beneficiary/api/withdrawals/route.ts` |
  | `app/auth/callback/route.ts` | `(beneficiary)/beneficiary/auth/callback/route.ts` |

### 6C: Update All References

- [ ] **Step 7: Update import paths**

  In every file under `(beneficiary)/beneficiary/`:
  - `from "@/lib/` → `from "@/beneficiary-lib/`
  - `from "@/utils/` → `from "@/beneficiary-utils/`
  - `from "@/app/components/` → `from "@/beneficiary-components/`
  - Relative `../../utils/` etc → `from "@/beneficiary-utils/`
  - `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_BENEFICIARY_BACKEND_URL`

- [ ] **Step 8: Update navigation and fetch paths**

  - `/login` → `/beneficiary/login`
  - `/signup` → `/beneficiary/signup`
  - `/dashboard` → `/beneficiary/dashboard`
  - `/campaigns` → `/beneficiary/campaigns`
  - `/campaigns/[id]` → `/beneficiary/campaigns/[id]`
  - `/banking-details` → `/beneficiary/banking-details`
  - `/connect-bank` → `/beneficiary/connect-bank`
  - `/fund-management` → `/beneficiary/fund-management`
  - `/identity-verification` → `/beneficiary/identity-verification`
  - `/otp` → `/beneficiary/otp`
  - `/profile-settings` → `/beneficiary/profile-settings`
  - `/request-withdrawal` → `/beneficiary/request-withdrawal`
  - `/security-settings` → `/beneficiary/security-settings`
  - `fetch('/api/auth/login')` → `fetch('/beneficiary/api/auth/login')`
  - `fetch('/api/auth/signup')` → `fetch('/beneficiary/api/auth/signup')`
  - `fetch('/api/bank-accounts')` → `fetch('/beneficiary/api/bank-accounts')`
  - `fetch('/api/campaigns')` → `fetch('/beneficiary/api/campaigns')`
  - `fetch('/api/identity-documents')` → `fetch('/beneficiary/api/identity-documents')`
  - `fetch('/api/withdrawals')` → `fetch('/beneficiary/api/withdrawals')`
  - `fetch('/auth/callback')` → `fetch('/beneficiary/auth/callback')`
  - In `app/api/auth/signup/route.ts`: update callback URL construction using `NEXT_PUBLIC_APP_URL` to append `/beneficiary/auth/callback`
  - Remove localhost fallbacks: `?? "http://localhost:3007"` → require env var

- [ ] **Step 9: Update static asset paths**

  - `/images/logo_h.png` → `/beneficiary/images/logo_h.png`
  - `/images/background.jpg` → `/beneficiary/images/background.jpg`

### 6D: Auth Cookie Logic

- [ ] **Step 10: Update beneficiary login page**

  In `(beneficiary)/beneficiary/login/page.tsx`:
  After successful Supabase auth (via `fetch('/beneficiary/api/auth/login')`):
  ```typescript
  document.cookie = 'persona=beneficiary; path=/; SameSite=Strict';
  router.push('/beneficiary/dashboard');
  ```

  Mount-time stale cookie check:
  ```typescript
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'beneficiary') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);
  ```

  In signup page — same stale cookie check.

  In auth callback route handler:
  ```typescript
  response.cookies.set('persona', 'beneficiary', { path: '/', sameSite: 'strict' });
  ```

### 6E: Logout

- [ ] **Step 11: Update all beneficiary logout handlers**

  ```typescript
  await supabase.auth.signOut();
  document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
  router.push('/beneficiary/login');
  ```

- [ ] **Step 12: Commit beneficiary migration**

  ```bash
  git add hope-card/src/app/\(beneficiary\)/ hope-card/src/beneficiary-lib/ hope-card/src/beneficiary-components/ hope-card/src/beneficiary-utils/ hope-card/public/beneficiary/
  git commit -m "feat(hope-card): migrate Beneficiary persona to /beneficiary/* prefix"
  ```

---

## Task 7: Root Page and Validation

**Files:**
- Modify: `hope-card/src/app/page.tsx`
- Delete: `hope-card/src/app/App.tsx`, `hope-card/src/app/App.css`, `hope-card/src/lib/sum.ts`

- [ ] **Step 1: Replace root page.tsx with persona selector**

  ```tsx
  import { redirect } from 'next/navigation';

  export default function Home() {
    // Bare root — middleware handles redirect for authenticated users.
    // For unauthenticated visitors, show persona entry points.
    return (
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <h1>HopeCard</h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/admin/login">Admin Portal</a>
          <a href="/donor/login">Digital Donor</a>
          <a href="/campaign-manager/create-account">Campaign Manager</a>
          <a href="/beneficiary/login">Beneficiary</a>
        </nav>
      </main>
    );
  }
  ```

- [ ] **Step 2: Delete non-standard scaffold files**

  Delete: `hope-card/src/app/App.tsx`, `hope-card/src/app/App.css`, `hope-card/src/lib/sum.ts`

- [ ] **Step 3: Run npm install**

  ```bash
  cd hope-card && npm install
  ```

- [ ] **Step 4: Run lint**

  ```bash
  cd hope-card && npm run lint
  ```

  Fix every error before proceeding. Zero errors required.

- [ ] **Step 5: Run build**

  ```bash
  cd hope-card && npm run build
  ```

  Build must succeed with zero errors. Fix type errors, import errors, and missing module errors until clean.

- [ ] **Step 6: Isolation check**

  ```bash
  git diff main --name-only
  ```

  Every changed file must be inside `hope-card/`. If any file outside appears, stop and flag it.

- [ ] **Step 7: ENV var audit**

  ```bash
  grep -rn "localhost:" hope-card/src/
  ```

  Must return 0 results. Any remaining localhost reference in source code (not comments) is a blocking error.

- [ ] **Step 8: Commit final validation**

  ```bash
  git add hope-card/src/app/page.tsx
  git rm hope-card/src/app/App.tsx hope-card/src/app/App.css hope-card/src/lib/sum.ts
  git commit -m "feat(hope-card): root page, cleanup, and validated build"
  ```
