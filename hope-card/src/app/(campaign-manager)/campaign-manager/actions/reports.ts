'use server';

import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';

export type DashboardMetrics = {
  fundsRaised: number;
  activeCampaigns: number;
  totalDonors: number;
  pendingActions: number;
  managerName: string;
};

export type DashboardCampaign = {
  id: string;
  title: string;
  status: string;
  collectedAmount: number;
  targetAmount: number;
  endDate: string | null;
  coverImageKey: string | null;
  createdAt: string;
};

export type LiveActivityItem = {
  id: string;
  donorName: string;
  amount: number;
  campaignTitle: string;
  purchasedAt: string;
};

export type MyCampaignRow = {
  id: string;
  title: string;
  status: string;
  collectedAmount: number;
  targetAmount: number;
  endDate: string | null;
  beneficiaryName: string;
  coverImageKey: string | null;
  createdAt: string;
};

export type DonorStatCards = {
  totalUniqueDonors: number;
  averageDonation: number;
  newDonorsThisMonth: number;
};

export type DonorRow = {
  id: string;
  name: string;
  email: string;
  totalContributed: number;
  donationCount: number;
  lastDonationDate: string | null;
  campaignTags: string[];
  tier: 'VIP DONOR' | 'MAJOR GIFT' | 'RECURRING' | 'STANDARD';
};

export type ReportStatCards = {
  totalFundsRaised: number;
  averageDonation: number;
  activeDonors: number;
  conversionRate: number;
};

export type WeeklyTrend = {
  weekLabel: string;
  current: number;
  previous: number;
};

export type CategoryBreakdown = {
  category: string;
  amount: number;
  percentage: number;
};

export type TransactionRow = {
  id: string;
  purchasedAt: string;
  donorName: string;
  donorInitials: string;
  campaignTitle: string;
  amount: number;
  paymentMethod: string;
  status: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function donorTier(totalAmount: number): DonorRow['tier'] {
  if (totalAmount >= 10000) return 'MAJOR GIFT';
  if (totalAmount >= 5000) return 'VIP DONOR';
  if (totalAmount >= 500) return 'RECURRING';
  return 'STANDARD';
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardData(authUserId: string): Promise<{
  metrics: DashboardMetrics;
  campaigns: DashboardCampaign[];
  liveActivity: LiveActivityItem[];
}> {
  const supabase = createAdminClient();

  const { data: managerProfile } = await supabase
    .from('campaign_manager_profiles')
    .select('first_name, last_name')
    .eq('auth_user_id', authUserId)
    .single();

  const managerName = managerProfile
    ? `${managerProfile.first_name} ${managerProfile.last_name}`
    : 'Manager';

  const { data: campaignRows } = await supabase
    .from('hc_campaigns')
    .select('id, title, status, collected_amount, target_amount, end_date, cover_image_key, created_at')
    .eq('created_by', authUserId)
    .order('created_at', { ascending: false });

  const campaignList = campaignRows ?? [];
  const campaignIds = campaignList.map((c) => c.id);

  const fundsRaised = campaignList.reduce((sum, c) => sum + Number(c.collected_amount ?? 0), 0);
  const activeCampaigns = campaignList.filter((c) => c.status === 'active').length;
  const pendingActions = campaignList.filter((c) => c.status === 'draft').length;

  let totalDonors = 0;
  let liveActivity: LiveActivityItem[] = [];

  if (campaignIds.length > 0) {
    const { data: hopecards } = await supabase
      .from('hopecards')
      .select('id, campaign_id')
      .in('campaign_id', campaignIds);

    const hopecardIds = (hopecards ?? []).map((h) => h.id);
    const hopecardCampaignMap = Object.fromEntries(
      (hopecards ?? []).map((h) => [h.id, h.campaign_id])
    );
    const campaignTitleMap = Object.fromEntries(campaignList.map((c) => [c.id, c.title]));

    if (hopecardIds.length > 0) {
      const { data: purchases } = await supabase
        .from('hopecard_purchases')
        .select('id, buyer_auth_id, amount_paid, purchased_at, hopecard_id, status')
        .in('hopecard_id', hopecardIds)
        .eq('status', 'paid')
        .order('purchased_at', { ascending: false });

      const purchaseList = purchases ?? [];
      totalDonors = new Set(purchaseList.map((p) => p.buyer_auth_id)).size;

      const recent = purchaseList.slice(0, 5);
      const buyerIds = recent.map((p) => p.buyer_auth_id);

      const { data: donors } = await supabase
        .from('digital_donor_profiles')
        .select('auth_user_id, first_name, last_name')
        .in('auth_user_id', buyerIds);

      const donorMap = Object.fromEntries(
        (donors ?? []).map((d) => [d.auth_user_id, `${d.first_name} ${d.last_name}`])
      );

      liveActivity = recent.map((p) => ({
        id: p.id,
        donorName: donorMap[p.buyer_auth_id] ?? 'Anonymous',
        amount: Number(p.amount_paid),
        campaignTitle: campaignTitleMap[hopecardCampaignMap[p.hopecard_id]] ?? 'Unknown Campaign',
        purchasedAt: p.purchased_at,
      }));
    }
  }

  return {
    metrics: { fundsRaised, activeCampaigns, totalDonors, pendingActions, managerName },
    campaigns: campaignList.slice(0, 5).map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      collectedAmount: Number(c.collected_amount ?? 0),
      targetAmount: Number(c.target_amount ?? 0),
      endDate: c.end_date,
      coverImageKey: c.cover_image_key,
      createdAt: c.created_at,
    })),
    liveActivity,
  };
}

// ─── My Campaigns ─────────────────────────────────────────────────────────────

export async function getMyCampaigns(
  authUserId: string,
  options: { status?: string; search?: string; page?: number }
): Promise<{ campaigns: MyCampaignRow[]; totalCount: number }> {
  const adminSupabase = createAdminClient();
  const page = options.page ?? 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  let query = adminSupabase
    .from('hc_campaigns')
    .select('id, title, status, collected_amount, target_amount, end_date, cover_image_key, created_at', { count: 'exact' })
    .eq('created_by', authUserId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (options.status && options.status !== 'all') {
    const dbStatus =
      options.status === 'active' ? 'active'
      : options.status === 'draft' ? 'draft'
      : options.status === 'completed' ? 'completed'
      : options.status === 'cancelled' ? 'cancelled'
      : null;
    if (dbStatus) query = query.eq('status', dbStatus);
  }

  if (options.search) {
    query = query.ilike('title', `%${options.search}%`);
  }

  const { data: campaigns, count } = await query;
  const campaignList = campaigns ?? [];
  const totalCount = count ?? 0;

  const campaignIds = campaignList.map((c) => c.id);
  let beneficiaryMap: Record<string, string> = {};

  if (campaignIds.length > 0) {
    const { data: links } = await adminSupabase
      .from('campaign_invitations')
      .select('campaign_id, beneficiary_profile_id')
      .in('campaign_id', campaignIds)
      .eq('status', 'accepted');

    const beneficiaryIds = [...new Set((links ?? []).map((l) => l.beneficiary_profile_id))];

    if (beneficiaryIds.length > 0) {
      const { data: beneficiaries } = await adminSupabase
        .from('beneficiary_profiles')
        .select('id, first_name, last_name')
        .in('id', beneficiaryIds);

      const bMap = Object.fromEntries(
        (beneficiaries ?? []).map((b) => [b.id, `${b.first_name} ${b.last_name}`])
      );

      for (const link of links ?? []) {
        if (!beneficiaryMap[link.campaign_id]) {
          beneficiaryMap[link.campaign_id] = bMap[link.beneficiary_profile_id] ?? '—';
        }
      }
    }
  }

  return {
    campaigns: campaignList.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      collectedAmount: Number(c.collected_amount ?? 0),
      targetAmount: Number(c.target_amount ?? 0),
      endDate: c.end_date,
      beneficiaryName: beneficiaryMap[c.id] ?? '—',
      coverImageKey: c.cover_image_key,
      createdAt: c.created_at,
    })),
    totalCount,
  };
}

// ─── Donors ───────────────────────────────────────────────────────────────────

export async function getDonorsData(
  authUserId: string,
  page: number = 1
): Promise<{
  statCards: DonorStatCards;
  donors: DonorRow[];
  totalCount: number;
}> {
  const adminSupabase = createAdminClient();
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data: managerCampaigns } = await adminSupabase
    .from('hc_campaigns')
    .select('id')
    .eq('created_by', authUserId);

  const managerCampaignIds = (managerCampaigns ?? []).map((c) => c.id);
  let totalUniqueDonors = 0;
  let averageDonation = 0;
  let newDonorsThisMonth = 0;

  if (managerCampaignIds.length > 0) {
    const { data: hopecards } = await adminSupabase
      .from('hopecards')
      .select('id')
      .in('campaign_id', managerCampaignIds);

    const hopecardIds = (hopecards ?? []).map((h) => h.id);

    if (hopecardIds.length > 0) {
      const { data: purchases } = await adminSupabase
        .from('hopecard_purchases')
        .select('buyer_auth_id, amount_paid, purchased_at')
        .in('hopecard_id', hopecardIds)
        .eq('status', 'paid');

      const purchaseList = purchases ?? [];
      const uniqueBuyerIds = [...new Set(purchaseList.map((p) => p.buyer_auth_id))];
      totalUniqueDonors = uniqueBuyerIds.length;

      if (purchaseList.length > 0) {
        const total = purchaseList.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        averageDonation = total / purchaseList.length;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const thisMonthBuyers = new Set(
        purchaseList
          .filter((p) => p.purchased_at >= startOfMonth)
          .map((p) => p.buyer_auth_id)
      );

      const priorBuyers = new Set(
        purchaseList
          .filter((p) => p.purchased_at < startOfMonth)
          .map((p) => p.buyer_auth_id)
      );

      for (const buyerId of thisMonthBuyers) {
        if (!priorBuyers.has(buyerId)) newDonorsThisMonth++;
      }
    }
  }

  const { data: allDonors, count } = await adminSupabase
    .from('digital_donor_profiles')
    .select('id, auth_user_id, first_name, last_name, email, total_donations_amount, total_donations_count', { count: 'exact' })
    .order('total_donations_amount', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const donorList = allDonors ?? [];
  const donorAuthIds = donorList.map((d) => d.auth_user_id).filter(Boolean);

  let lastDonationMap: Record<string, string> = {};
  let campaignTagsMap: Record<string, string[]> = {};

  if (donorAuthIds.length > 0) {
    const { data: recentPurchases } = await adminSupabase
      .from('hopecard_purchases')
      .select('buyer_auth_id, purchased_at, hopecard_id')
      .in('buyer_auth_id', donorAuthIds)
      .eq('status', 'paid')
      .order('purchased_at', { ascending: false });

    for (const p of recentPurchases ?? []) {
      if (!lastDonationMap[p.buyer_auth_id]) {
        lastDonationMap[p.buyer_auth_id] = p.purchased_at;
      }
    }

    const hopecardIds = [...new Set((recentPurchases ?? []).map((p) => p.hopecard_id))];
    if (hopecardIds.length > 0) {
      const { data: hopecardRows } = await adminSupabase
        .from('hopecards')
        .select('id, campaign_id')
        .in('id', hopecardIds);

      const hcardCampaignMap = Object.fromEntries(
        (hopecardRows ?? []).map((h) => [h.id, h.campaign_id])
      );

      const campaignIdSet = new Set(Object.values(hcardCampaignMap));
      const campaignIds2 = [...campaignIdSet];
      const { data: campaignRows } = campaignIds2.length > 0
        ? await adminSupabase
            .from('hc_campaigns')
            .select('id, title, category')
            .in('id', campaignIds2)
        : { data: [] };

      const campaignMap = Object.fromEntries((campaignRows ?? []).map((c) => [c.id, c.title]));

      // Pre-group purchases by buyer to avoid O(n*m) filter in loop
      const purchasesByBuyer: Record<string, NonNullable<typeof recentPurchases>> = {};
      for (const p of recentPurchases ?? []) {
        if (!purchasesByBuyer[p.buyer_auth_id]) purchasesByBuyer[p.buyer_auth_id] = [];
        purchasesByBuyer[p.buyer_auth_id].push(p);
      }

      for (const buyerId of donorAuthIds) {
        const buyerPurchases = purchasesByBuyer[buyerId] ?? [];
        const tags: string[] = [];
        for (const p of buyerPurchases) {
          const title = campaignMap[hcardCampaignMap[p.hopecard_id]];
          if (title && !tags.includes(title.toUpperCase().slice(0, 12))) {
            tags.push(title.toUpperCase().slice(0, 12));
          }
          if (tags.length >= 2) break;
        }
        campaignTagsMap[buyerId] = tags;
      }
    }
  }

  return {
    statCards: { totalUniqueDonors, averageDonation, newDonorsThisMonth },
    donors: donorList.map((d) => ({
      id: d.id,
      name: `${d.first_name} ${d.last_name}`,
      email: d.email ?? '',
      totalContributed: Number(d.total_donations_amount ?? 0),
      donationCount: Number(d.total_donations_count ?? 0),
      lastDonationDate: lastDonationMap[d.auth_user_id] ?? null,
      campaignTags: campaignTagsMap[d.auth_user_id] ?? [],
      tier: donorTier(Number(d.total_donations_amount ?? 0)),
    })),
    totalCount: count ?? 0,
  };
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getReportsData(
  authUserId: string,
  page: number = 1
): Promise<{
  statCards: ReportStatCards;
  weeklyTrends: WeeklyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  transactions: TransactionRow[];
  totalTransactions: number;
}> {
  const adminSupabase = createAdminClient();
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data: managerCampaigns } = await adminSupabase
    .from('hc_campaigns')
    .select('id, title, category, collected_amount, status')
    .eq('created_by', authUserId);

  const campaignList = managerCampaigns ?? [];
  const campaignIds = campaignList.map((c) => c.id);

  const totalFundsRaised = campaignList.reduce((sum, c) => sum + Number(c.collected_amount ?? 0), 0);

  let allPurchases: any[] = [];
  let hopecardCampaignMap: Record<string, string> = {};

  if (campaignIds.length > 0) {
    const { data: hopecards } = await adminSupabase
      .from('hopecards')
      .select('id, campaign_id')
      .in('campaign_id', campaignIds);

    hopecardCampaignMap = Object.fromEntries(
      (hopecards ?? []).map((h) => [h.id, h.campaign_id])
    );

    const hopecardIds = (hopecards ?? []).map((h) => h.id);

    if (hopecardIds.length > 0) {
      const { data: purchases } = await adminSupabase
        .from('hopecard_purchases')
        .select('id, buyer_auth_id, amount_paid, purchased_at, payment_method, status, hopecard_id')
        .in('hopecard_id', hopecardIds)
        .order('purchased_at', { ascending: false });

      allPurchases = purchases ?? [];
    }
  }

  const paidPurchases = allPurchases.filter((p) => p.status === 'paid');
  const averageDonation =
    paidPurchases.length > 0
      ? paidPurchases.reduce((sum, p) => sum + Number(p.amount_paid), 0) / paidPurchases.length
      : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeDonors = new Set(
    paidPurchases
      .filter((p) => new Date(p.purchased_at) >= thirtyDaysAgo)
      .map((p) => p.buyer_auth_id)
  ).size;

  const conversionRate =
    allPurchases.length > 0 ? (paidPurchases.length / allPurchases.length) * 100 : 0;

  const now = new Date();
  const sixteenWeeksAgo = new Date(now);
  sixteenWeeksAgo.setDate(now.getDate() - 112);

  const recentPurchases = paidPurchases.filter(
    (p) => new Date(p.purchased_at) >= sixteenWeeksAgo
  );

  const weekTotals: Record<string, { date: Date; total: number }> = {};
  for (const p of recentPurchases) {
    const d = new Date(p.purchased_at);
    d.setDate(d.getDate() - d.getDay());
    const key = d.toISOString().split('T')[0];
    if (!weekTotals[key]) weekTotals[key] = { date: d, total: 0 };
    weekTotals[key].total += Number(p.amount_paid);
  }

  const sortedWeeks = Object.entries(weekTotals).sort(([a], [b]) => a.localeCompare(b));
  const currentWeeks = sortedWeeks.slice(-8);
  const previousWeeks = sortedWeeks.slice(-16, -8);

  const weeklyTrends: WeeklyTrend[] = Array.from({ length: 8 }).map((_, i) => ({
    weekLabel: currentWeeks[i] ? getWeekStart(currentWeeks[i][1].date) : `W${i + 1}`,
    current: currentWeeks[i] ? currentWeeks[i][1].total : 0,
    previous: previousWeeks[i] ? previousWeeks[i][1].total : 0,
  }));

  const categoryTotals: Record<string, number> = {};
  for (const c of campaignList) {
    const cat = c.category ?? 'other';
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(c.collected_amount ?? 0);
  }
  const totalForCategories = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      percentage: totalForCategories > 0 ? Math.round((amount / totalForCategories) * 100) : 0,
    })
  );

  const campaignTitleMap = Object.fromEntries(campaignList.map((c) => [c.id, c.title]));

  // Fetch paginated transactions server-side
  let pageTransactions: any[] = [];
  let totalTransactions = 0;

  if (Object.keys(hopecardCampaignMap).length > 0) {
    const hopecardIdsForTx = Object.keys(hopecardCampaignMap);
    const { data: txData, count: txCount } = await adminSupabase
      .from('hopecard_purchases')
      .select('id, buyer_auth_id, amount_paid, purchased_at, payment_method, status, hopecard_id', { count: 'exact' })
      .in('hopecard_id', hopecardIdsForTx)
      .order('purchased_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    pageTransactions = txData ?? [];
    totalTransactions = txCount ?? 0;
  }

  const buyerIds = [...new Set(pageTransactions.map((p) => p.buyer_auth_id))];

  let donorNameMap: Record<string, string> = {};
  if (buyerIds.length > 0) {
    const { data: donors } = await adminSupabase
      .from('digital_donor_profiles')
      .select('auth_user_id, first_name, last_name')
      .in('auth_user_id', buyerIds);

    donorNameMap = Object.fromEntries(
      (donors ?? []).map((d) => [d.auth_user_id, `${d.first_name} ${d.last_name}`])
    );
  }

  const transactions: TransactionRow[] = pageTransactions.map((p) => {
    const name = donorNameMap[p.buyer_auth_id] ?? 'Anonymous';
    const initials = name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return {
      id: p.id,
      purchasedAt: p.purchased_at,
      donorName: name,
      donorInitials: initials,
      campaignTitle: campaignTitleMap[hopecardCampaignMap[p.hopecard_id]] ?? 'Unknown',
      amount: Number(p.amount_paid),
      paymentMethod: p.payment_method ?? 'Unknown',
      status: p.status,
    };
  });

  return {
    statCards: { totalFundsRaised, averageDonation, activeDonors, conversionRate },
    weeklyTrends,
    categoryBreakdown,
    transactions,
    totalTransactions,
  };
}
