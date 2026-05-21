'use server';

import { createAdminClient } from '@/campaign-manager-utils/supabase/admin';
import { createClient } from '@/campaign-manager-utils/supabase/server';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  managerName: string;
  fundsRaised: number;
  activeCampaigns: number;
  totalDonors: number;
  pendingActions: number;
}

export interface DashboardCampaign {
  id: string;
  title: string;
  status: string;
  collectedAmount: number;
  targetAmount: number;
  endDate: string | null;
}

export interface LiveActivityItem {
  id: string;
  donorName: string;
  amount: number;
  campaignTitle: string;
  purchasedAt: string;
}

export interface MyCampaignRow {
  id: string;
  title: string;
  status: string;
  collectedAmount: number;
  targetAmount: number;
  endDate: string | null;
  beneficiaryName: string;
  coverImageKey: string | null;
  createdAt: string;
}

export interface ReportStatCards {
  totalFundsRaised: number;
  averageDonation: number;
  activeDonors: number;
  conversionRate: number;
}

export interface WeeklyTrend {
  weekLabel: string;
  current: number;
  previous: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface TransactionRow {
  id: string;
  purchasedAt: string;
  donorName: string;
  donorInitials: string;
  campaignTitle: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

export interface DonorStatCards {
  totalUniqueDonors: number;
  averageDonation: number;
  newDonorsThisMonth: number;
}

export interface DonorRow {
  id: string;
  name: string;
  email: string;
  totalContributed: number;
  donationCount: number;
  lastDonationDate: string | null;
  campaignTags: string[];
  tier: string;
  phone?: string;
  address?: string;
  preferredPaymentMethod?: string;
}

// ─── getDashboardData ─────────────────────────────────────────────────────────

export async function getDashboardData(authUserId: string): Promise<{
  metrics: DashboardMetrics;
  campaigns: DashboardCampaign[];
  liveActivity: LiveActivityItem[];
}> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('campaign_manager_profiles')
    .select('first_name, last_name')
    .eq('auth_user_id', authUserId)
    .single();

  const managerName = profile ? `${profile.first_name} ${profile.last_name}` : 'Manager';

  const { data: campaigns } = await admin
    .from('hc_campaigns')
    .select('id, title, status, collected_amount, target_amount, end_date')
    .eq('created_by', authUserId)
    .order('created_at', { ascending: false })
    .limit(5);

  const campaignList = campaigns ?? [];
  const activeCampaigns = campaignList.filter((c: any) => c.status === 'active').length;
  const fundsRaised = campaignList.reduce((s: number, c: any) => s + Number(c.collected_amount ?? 0), 0);
  const pendingActions = campaignList.filter((c: any) => c.status === 'draft').length;

  const campaignIds = campaignList.map((c: any) => c.id);

  let totalDonors = 0;
  let liveActivity: LiveActivityItem[] = [];

  if (campaignIds.length > 0) {
    const { data: purchases } = await admin
      .from('hc_card_purchases')
      .select('id, donor_profile_id, amount, campaign_id, purchased_at')
      .in('campaign_id', campaignIds)
      .order('purchased_at', { ascending: false })
      .limit(10);

    const purchaseList = purchases ?? [];
    const donorIds = [...new Set(purchaseList.map((p: any) => p.donor_profile_id))];
    totalDonors = donorIds.length;

    const { data: donorProfiles } = donorIds.length > 0
      ? await admin.from('donor_profiles').select('id, first_name, last_name').in('id', donorIds)
      : { data: [] };

    const donorMap = Object.fromEntries(
      (donorProfiles ?? []).map((d: any) => [d.id, `${d.first_name} ${d.last_name}`])
    );

    const campaignTitleMap = Object.fromEntries(campaignList.map((c: any) => [c.id, c.title]));

    liveActivity = purchaseList.slice(0, 6).map((p: any) => ({
      id: p.id,
      donorName: donorMap[p.donor_profile_id] ?? 'Anonymous',
      amount: Number(p.amount ?? 0),
      campaignTitle: campaignTitleMap[p.campaign_id] ?? 'Unknown Campaign',
      purchasedAt: p.purchased_at,
    }));
  }

  return {
    metrics: { managerName, fundsRaised, activeCampaigns, totalDonors, pendingActions },
    campaigns: campaignList.map((c: any) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      collectedAmount: Number(c.collected_amount ?? 0),
      targetAmount: Number(c.target_amount ?? 0),
      endDate: c.end_date,
    })),
    liveActivity,
  };
}

// ─── getReportsData ───────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

export async function getReportsData(
  authUserId: string,
  page: number,
): Promise<{
  statCards: ReportStatCards;
  weeklyTrends: WeeklyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  transactions: TransactionRow[];
  totalTransactions: number;
}> {
  const admin = createAdminClient();

  const { data: campaigns } = await admin
    .from('hc_campaigns')
    .select('id, title, category, status')
    .eq('created_by', authUserId);

  const campaignIds = (campaigns ?? []).map((c: any) => c.id);
  const campaignTitleMap = Object.fromEntries((campaigns ?? []).map((c: any) => [c.id, c.title]));
  const campaignCategoryMap = Object.fromEntries((campaigns ?? []).map((c: any) => [c.id, c.category ?? 'Other']));

  if (campaignIds.length === 0) {
    return {
      statCards: { totalFundsRaised: 0, averageDonation: 0, activeDonors: 0, conversionRate: 0 },
      weeklyTrends: [],
      categoryBreakdown: [],
      transactions: [],
      totalTransactions: 0,
    };
  }

  const { data: allPurchases, count } = await admin
    .from('hc_card_purchases')
    .select('id, donor_profile_id, amount, campaign_id, purchased_at, status', { count: 'exact' })
    .in('campaign_id', campaignIds)
    .order('purchased_at', { ascending: false })
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

  const purchases = allPurchases ?? [];
  const totalTransactions = count ?? 0;

  const { data: allPurchasesForStats } = await admin
    .from('hc_card_purchases')
    .select('donor_profile_id, amount, campaign_id, purchased_at')
    .in('campaign_id', campaignIds);

  const statPurchases = allPurchasesForStats ?? [];
  const totalFundsRaised = statPurchases.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
  const averageDonation = statPurchases.length > 0 ? totalFundsRaised / statPurchases.length : 0;
  const activeDonors = new Set(statPurchases.map((p: any) => p.donor_profile_id)).size;
  const activeCampaigns = (campaigns ?? []).filter((c: any) => c.status === 'active').length;
  const conversionRate = activeCampaigns > 0 ? Math.min((activeDonors / (activeDonors + 10)) * 100, 100) : 0;

  // Weekly trends (last 8 weeks vs previous 8 weeks)
  const now = new Date();
  const weeklyTrends: WeeklyTrend[] = Array.from({ length: 6 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (5 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);

    const current = statPurchases
      .filter((p: any) => new Date(p.purchased_at) >= weekStart && new Date(p.purchased_at) < weekEnd)
      .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);

    const previous = statPurchases
      .filter((p: any) => new Date(p.purchased_at) >= prevStart && new Date(p.purchased_at) < weekStart)
      .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);

    return {
      weekLabel: `W${i + 1}`,
      current,
      previous,
    };
  });

  // Category breakdown
  const catTotals: Record<string, number> = {};
  for (const p of statPurchases) {
    const cat = campaignCategoryMap[p.campaign_id] ?? 'Other';
    catTotals[cat] = (catTotals[cat] ?? 0) + Number(p.amount ?? 0);
  }
  const totalCat = Object.values(catTotals).reduce((s, v) => s + v, 0);
  const categoryBreakdown: CategoryBreakdown[] = Object.entries(catTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalCat > 0 ? Math.round((amount / totalCat) * 100) : 0,
  }));

  // Transactions with donor names
  const donorIds = [...new Set(purchases.map((p: any) => p.donor_profile_id))];
  const { data: donorProfiles } = donorIds.length > 0
    ? await admin.from('donor_profiles').select('id, first_name, last_name').in('id', donorIds)
    : { data: [] };

  const donorMap = Object.fromEntries(
    (donorProfiles ?? []).map((d: any) => [d.id, `${d.first_name} ${d.last_name}`])
  );

  const transactions: TransactionRow[] = purchases.map((p: any) => {
    const name = donorMap[p.donor_profile_id] ?? 'Anonymous';
    const initials = name.split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
    return {
      id: p.id,
      purchasedAt: p.purchased_at,
      donorName: name,
      donorInitials: initials,
      campaignTitle: campaignTitleMap[p.campaign_id] ?? '—',
      amount: Number(p.amount ?? 0),
      paymentMethod: 'Card',
      status: p.status ?? 'paid',
    };
  });

  return { statCards: { totalFundsRaised, averageDonation, activeDonors, conversionRate }, weeklyTrends, categoryBreakdown, transactions, totalTransactions };
}

// ─── getDonorsData ────────────────────────────────────────────────────────────

export async function getDonorsData(
  authUserId: string,
  page: number,
  search = '',
): Promise<{ statCards: DonorStatCards; donors: DonorRow[]; totalCount: number }> {
  const admin = createAdminClient();

  // Get campaigns owned by this manager
  const { data: campaigns } = await admin
    .from('hc_campaigns')
    .select('id, title')
    .eq('created_by', authUserId);

  const campaignList = campaigns ?? [];
  const campaignIds = campaignList.map((c: any) => c.id);
  const campaignTitleMap: Record<string, string> = Object.fromEntries(
    campaignList.map((c: any) => [c.id, c.title])
  );

  const empty = { statCards: { totalUniqueDonors: 0, averageDonation: 0, newDonorsThisMonth: 0 }, donors: [], totalCount: 0 };
  if (campaignIds.length === 0) return empty;

  // Get hopecards for these campaigns
  const { data: hopecards } = await admin
    .from('hopecards')
    .select('id, campaign_id')
    .in('campaign_id', campaignIds);

  const hopecardList = hopecards ?? [];
  const hopecardIds = hopecardList.map((h: any) => h.id);
  const hopecardCampaignMap: Record<string, string> = Object.fromEntries(
    hopecardList.map((h: any) => [h.id, h.campaign_id])
  );

  if (hopecardIds.length === 0) return empty;

  // Get purchases for these hopecards
  const { data: purchases } = await admin
    .from('hopecard_purchases')
    .select('buyer_auth_id, hopecard_id, amount_paid, purchased_at')
    .in('hopecard_id', hopecardIds);

  const purchaseList = purchases ?? [];

  // Aggregate per buyer_auth_id
  const donorAgg: Record<string, {
    total: number; count: number;
    lastDate: string | null; lastCampaignId: string | null;
  }> = {};

  for (const p of purchaseList) {
    const uid = p.buyer_auth_id;
    if (!uid) continue;
    if (!donorAgg[uid]) donorAgg[uid] = { total: 0, count: 0, lastDate: null, lastCampaignId: null };
    donorAgg[uid].total += Number(p.amount_paid ?? 0);
    donorAgg[uid].count += 1;
    const cid = hopecardCampaignMap[p.hopecard_id];
    if (!donorAgg[uid].lastDate || p.purchased_at > donorAgg[uid].lastDate!) {
      donorAgg[uid].lastDate = p.purchased_at;
      donorAgg[uid].lastCampaignId = cid ?? null;
    }
  }

  const allAuthIds = Object.keys(donorAgg);

  // Fetch profiles (with optional search filter)
  let profileQuery = admin
    .from('digital_donor_profiles')
    .select('id, auth_user_id, first_name, last_name, email, phone, address, preferred_payment_method')
    .in('auth_user_id', allAuthIds);

  if (search) {
    profileQuery = profileQuery.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data: allProfiles } = await profileQuery;
  const filteredProfiles = allProfiles ?? [];
  const totalCount = filteredProfiles.length;

  // Stats
  const totalRaised = purchaseList.reduce((s: number, p: any) => s + Number(p.amount_paid ?? 0), 0);
  const averageDonation = purchaseList.length > 0 ? totalRaised / purchaseList.length : 0;
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const newDonorsThisMonth = allAuthIds.filter((uid) => {
    const last = donorAgg[uid].lastDate;
    return last && new Date(last) >= monthAgo;
  }).length;

  // Paginate
  const paginated = filteredProfiles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const donors: DonorRow[] = paginated.map((d: any) => {
    const agg = donorAgg[d.auth_user_id] ?? { total: 0, count: 0, lastDate: null, lastCampaignId: null };
    const name = `${d.first_name} ${d.last_name}`;
    const lastTag = agg.lastCampaignId ? (campaignTitleMap[agg.lastCampaignId] ?? '') : '';
    let tier = 'STANDARD';
    if (agg.total >= 50000) tier = 'VIP DONOR';
    else if (agg.total >= 10000) tier = 'MAJOR GIFT';
    else if (agg.count >= 3) tier = 'RECURRING';
    return {
      id: d.id,
      name,
      email: d.email ?? '',
      totalContributed: agg.total,
      donationCount: agg.count,
      lastDonationDate: agg.lastDate,
      campaignTags: lastTag ? [lastTag] : [],
      tier,
      phone: d.phone ?? undefined,
      address: d.address ?? undefined,
      preferredPaymentMethod: d.preferred_payment_method ?? undefined,
    };
  });

  return {
    statCards: { totalUniqueDonors: totalCount, averageDonation, newDonorsThisMonth },
    donors,
    totalCount,
  };
}
