'use client';

import Link from 'next/link';
import {
  Bell,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Heart,
  Megaphone,
  Plus,
  QrCode,
  Rocket,
} from 'lucide-react';
import AppShell from '@/campaign-manager-components/AppShell';
import type {
  DashboardMetrics,
  DashboardCampaign,
  LiveActivityItem,
} from '@/app/(campaign-manager)/campaign-manager/actions/reports';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  active: { label: 'ACTIVE', className: 'bg-[#ddf7e8] text-[#3caa71]' },
  draft: { label: 'DRAFT', className: 'bg-[#ffe7d7] text-[#e38f4d]' },
  completed: { label: 'COMPLETED', className: 'bg-[#ddf7e8] text-[#3caa71]' },
  cancelled: { label: 'CANCELLED', className: 'bg-[#fde8e5] text-[#c86a5d]' },
};

const quickActions = [
  { icon: Megaphone, label: 'Updates' },
  { icon: FileText, label: 'CSV Report' },
  { icon: ClipboardCheck, label: 'Proof' },
  { icon: QrCode, label: 'QR Code' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function getInitials(name: string): string {
  return name.split(' ').filter((w) => w.length > 0).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const ms = new Date(dateStr).getTime();
  if (Number.isNaN(ms)) return 'Unknown time';
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function DashboardUI({
  metrics,
  campaigns,
  liveActivity,
  userName,
  userRole,
}: {
  metrics: DashboardMetrics;
  campaigns: DashboardCampaign[];
  liveActivity: LiveActivityItem[];
  userName?: string;
  userRole?: string;
}) {
  const metricCards = [
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fdf2d8]',
      iconColor: 'text-[#b58b28]',
      badge: formatCurrency(metrics.fundsRaised),
      badgeColor: 'text-[#bf9336]',
      title: 'Funds Raised',
      value: formatCurrency(metrics.fundsRaised),
    },
    {
      icon: Rocket,
      iconBg: 'bg-[#fde7e1]',
      iconColor: 'text-[#c86b5e]',
      badge: `${metrics.activeCampaigns} Active`,
      badgeColor: 'text-[#ca7264]',
      title: 'Active Campaigns',
      value: metrics.activeCampaigns.toString(),
    },
    {
      icon: Heart,
      iconBg: 'bg-[#fdeceb]',
      iconColor: 'text-[#c66b62]',
      badge: `${metrics.totalDonors} Total`,
      badgeColor: 'text-[#cf746b]',
      title: 'Total Donors',
      value: metrics.totalDonors.toLocaleString(),
    },
    {
      icon: Bell,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#ca655d]',
      badge: metrics.pendingActions > 0 ? 'Action Required' : 'All Clear',
      badgeColor: metrics.pendingActions > 0 ? 'text-[#d14f45]' : 'text-[#3caa71]',
      title: 'Draft Actions',
      value: metrics.pendingActions.toString(),
    },
  ];

  return (
    <AppShell userName={userName} userRole={userRole}>
      <div className="mx-auto max-w-[1120px]">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#2e2523] sm:text-[28px]">
            Welcome back, {metrics.managerName.split(' ')[0]}
          </h1>
          <p className="mt-1 text-[14px] text-[#84716b]">
            You have{' '}
            <span className="font-semibold text-[#d59654]">
              {metrics.activeCampaigns} active campaign{metrics.activeCampaigns !== 1 ? 's' : ''}
            </span>{' '}
            running right now.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(({ icon: Icon, iconBg, iconColor, badge, badgeColor, title, value }) => (
            <article
              key={title}
              className="min-h-[132px] rounded-[22px] bg-white px-5 py-4 shadow-[0_14px_36px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <span className={`rounded-full bg-[#fcf6f3] px-3 py-1 text-[10px] font-bold ${badgeColor}`}>
                  {badge}
                </span>
              </div>
              <p className="mt-5 text-[12px] font-semibold text-[#8a7a75]">{title}</p>
              <p className="mt-1 text-[16px] font-extrabold text-[#342827] sm:text-[17px]">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_255px]">
          <div className="min-w-0">
            <section className="overflow-hidden rounded-[26px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex flex-col gap-4 border-b border-[#f4ebea] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[18px] font-extrabold text-[#382b28]">My Campaigns</h2>
                <Link
                  href="/campaign-manager/my-campaigns"
                  className="text-[11px] font-bold text-[#c96a5b] hover:underline"
                >
                  View All →
                </Link>
              </div>

              {campaigns.length === 0 ? (
                <div className="px-5 py-10 text-center text-[14px] text-[#84716b]">
                  No campaigns yet.{' '}
                  <Link href="/campaign-manager/create-campaign" className="font-bold text-[#c96a5b]">
                    Create your first one.
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                        <th className="px-4 py-4">Campaign Name</th>
                        <th className="px-3 py-4">Status</th>
                        <th className="px-3 py-4">Goal / Raised</th>
                        <th className="px-3 py-4">Progress</th>
                        <th className="px-3 py-4">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => {
                        const statusInfo = STATUS_LABEL[campaign.status] ?? STATUS_LABEL.draft;
                        const progress =
                          campaign.targetAmount > 0
                            ? Math.min(
                                Math.round((campaign.collectedAmount / campaign.targetAmount) * 100),
                                100
                              )
                            : 0;
                        const deadline = campaign.endDate
                          ? new Date(campaign.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—';
                        return (
                          <tr key={campaign.id} className="border-t border-[#f4ebea]">
                            <td className="px-4 py-5 align-top">
                              <div className="flex items-center gap-3">
                                <div className="h-[34px] w-[34px] rounded-lg bg-[#f7f4f3] flex items-center justify-center text-[10px] font-bold text-[#8a7a75]">
                                  {getInitials(campaign.title)}
                                </div>
                                <p className="max-w-[105px] text-[14px] font-bold leading-[1.15] text-[#3c302d]">
                                  {campaign.title}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-5 align-top">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-extrabold ${statusInfo.className}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-3 py-5 align-top text-[12px] leading-[1.35]">
                              <p className="text-[#9a8d87]">Raised</p>
                              <p className="font-bold text-[#554541]">{formatCurrency(campaign.collectedAmount)}</p>
                              <p className="mt-1 text-[#9a8d87]">Goal:</p>
                              <p className="font-extrabold text-[#453633]">{formatCurrency(campaign.targetAmount)}</p>
                            </td>
                            <td className="px-3 py-5 align-top">
                              <div className="w-[110px]">
                                <div className="h-2 rounded-full bg-[#f4e7e5]">
                                  <div
                                    className="h-2 rounded-full bg-[#c96a5b]"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="mt-2 text-[10px] font-bold text-[#c96a5b]">{progress}% Complete</p>
                              </div>
                            </td>
                            <td className="px-3 py-5 align-top text-[13px] font-medium leading-[1.25] text-[#6d5d59]">
                              {deadline}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Quick Actions</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {quickActions.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] bg-[#faf7f5] text-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c96a5b] shadow-[0_8px_18px_rgba(87,55,48,0.05)]">
                      <Icon size={16} />
                    </div>
                    <span className="mt-3 text-[11px] font-bold text-[#6d5d59]">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-h-[420px] rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Live Activity</h2>
                <span className="h-2.5 w-2.5 rounded-full bg-[#c85d50]" />
              </div>

              <div className="mt-5 space-y-5">
                {liveActivity.length === 0 ? (
                  <p className="text-[12px] text-[#8d7d78]">No recent activity.</p>
                ) : (
                  liveActivity.map((item) => (
                    <article key={item.id} className="flex gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff4d9]">
                        <CircleDollarSign size={15} className="text-[#bb9037]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[12px] font-extrabold text-[#433330]">New Donation Received</h3>
                        <p className="mt-1 text-[10px] leading-[1.35] text-[#8d7d78]">
                          {item.donorName} donated {formatCurrency(item.amount)} to {item.campaignTitle}
                        </p>
                        <p className="mt-1 text-[9px] font-medium text-[#b0a39f]">{timeAgo(item.purchasedAt)}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <Link
                href="/campaign-manager/create-campaign"
                className="mt-5 flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#b55247] text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
              >
                <Plus size={16} />
                New Campaign
              </Link>

              <Link href="/campaign-manager/my-campaigns" className="mt-4 block w-full text-center text-[11px] font-bold text-[#c96a5b]">
                View All Activity
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
