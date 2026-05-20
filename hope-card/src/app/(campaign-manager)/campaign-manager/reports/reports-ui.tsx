'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Download,
  MoreVertical,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import AppShell from '@/campaign-manager-components/AppShell';
import type {
  ReportStatCards,
  WeeklyTrend,
  CategoryBreakdown,
  TransactionRow,
} from '@/app/(campaign-manager)/campaign-manager/actions/reports';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_CLASS: Record<string, string> = {
  paid: 'bg-[#fff6db] text-[#b9922e]',
  pending: 'bg-[#fde8e5] text-[#c86a5d]', // Keeping the key as pending for logic but user sees DRAFT if mapped
  draft: 'bg-[#fde8e5] text-[#c86a5d]',
  failed: 'bg-[#f1efee] text-[#9e9692]',
  refunded: 'bg-[#f1efee] text-[#9e9692]',
};

const CATEGORY_COLORS = ['#a45b52', '#f08d87', '#a78310', '#6b8fa3', '#7a6b8f'];

export default function ReportsUI({
  statCards,
  weeklyTrends,
  categoryBreakdown,
  transactions,
  totalTransactions,
  currentPage,
  managerName,
}: {
  statCards: ReportStatCards;
  weeklyTrends: WeeklyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  transactions: TransactionRow[];
  totalTransactions: number;
  currentPage: number;
  managerName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage) || 1;

  function handlePage(p: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', p.toString());
    startTransition(() => router.push(`/reports?${next.toString()}`));
  }

  const statCardData = [
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: '+12.4%',
      badgeClass: 'text-[#c86a5d]',
      title: 'Total Funds Raised',
      value: formatCurrency(statCards.totalFundsRaised),
    },
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fff3d5]',
      iconColor: 'text-[#bb9432]',
      badge: '+4.2%',
      badgeClass: 'text-[#bb9432]',
      title: 'Average Donation',
      value: formatCurrency(statCards.averageDonation),
    },
    {
      icon: Users,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: 'Active',
      badgeClass: 'text-[#c86a5d]',
      title: 'Active Donors',
      value: statCards.activeDonors.toLocaleString(),
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-[#f4f1ef]',
      iconColor: 'text-[#8f817d]',
      badge: `+0.6%`,
      badgeClass: 'text-[#bb9432]',
      title: 'Conversion Rate',
      value: `${statCards.conversionRate.toFixed(1)}%`,
    },
  ];

  // Build SVG paths for weekly trends chart
  const maxVal = Math.max(...weeklyTrends.flatMap((w) => [w.current, w.previous]), 1);
  const chartW = 560;
  const chartH = 220;
  const padX = 20;
  const padY = 20;

  function toPoint(index: number, value: number): [number, number] {
    if (weeklyTrends.length <= 1) {
      return [padX + (chartW - padX * 2) / 2, chartH - padY];
    }
    const x = padX + (index / (weeklyTrends.length - 1)) * (chartW - padX * 2);
    const y = chartH - padY - (value / maxVal) * (chartH - padY * 2);
    return [x, y];
  }

  function buildPath(series: 'current' | 'previous'): string {
    return weeklyTrends
      .map((w, i) => {
        const [x, y] = toPoint(i, series === 'current' ? w.current : w.previous);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  // Category donut
  const totalCat = categoryBreakdown.reduce((s, c) => s + c.amount, 0);
  let cumulativePct = 0;
  function conicStop(pct: number, color: string, prev: number): string {
    return `${color} ${prev}% ${prev + pct}%`;
  }
  const conicStops = categoryBreakdown.map((c, i) => {
    const pct = totalCat > 0 ? (c.amount / totalCat) * 100 : 0;
    const stop = conicStop(pct, CATEGORY_COLORS[i % CATEGORY_COLORS.length], cumulativePct);
    cumulativePct += pct;
    return stop;
  });
  const conicGradient =
    conicStops.length > 0
      ? `conic-gradient(${conicStops.join(', ')})`
      : 'conic-gradient(#f3ebe7 0% 100%)';

  return (
    <AppShell userName={managerName} userRole="Campaign Manager" searchPlaceholder="Search reports...">
      <div className="w-full space-y-6 pb-28">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">
              Financial Reports &amp; Insights
            </h1>
            <p className="mt-2 max-w-[760px] text-[15px] text-[#84716b]">
              Analyze fundraising performance, donor demographics, and impact metrics across your active campaigns.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#5d4c48] shadow-[0_12px_30px_rgba(87,55,48,0.06)] ring-1 ring-[#f0e7e3]"
            >
              <CalendarDays size={16} />
              Last 30 Days
            </button>
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {statCardData.map(({ icon: Icon, iconBg, iconColor, badge, badgeClass, title, value }) => (
            <section
              key={title}
              className="rounded-[24px] bg-white p-5 shadow-[0_14px_36px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <span className={`rounded-full bg-[#fcf6f3] px-3 py-1 text-[11px] font-bold ${badgeClass}`}>
                  {badge}
                </span>
              </div>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">{title}</p>
              <p className="mt-2 text-[18px] font-extrabold text-[#342827]">{value}</p>
            </section>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Fundraising Trends</h2>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-[0.04em] text-[#9b8d88]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f08d87]" />
                  Current Period
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#a78310]" />
                  Previous Period
                </span>
              </div>
            </div>

            <div className="mt-6 h-[300px] rounded-[24px] bg-[#fffdfa] p-4">
              {weeklyTrends.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-[#84716b]">
                  No transaction data yet.
                </div>
              ) : (
                <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="h-full w-full">
                  <path
                    d={buildPath('current')}
                    fill="none"
                    stroke="#f08d87"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={buildPath('previous')}
                    fill="none"
                    stroke="#a78310"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g fill="#c6b8b3" fontSize="11" fontWeight="700">
                    {weeklyTrends.map((w, i) => {
                      const [x] = toPoint(i, 0);
                      return (
                        <text key={i} x={x} y={chartH + 20} textAnchor="middle">
                          {w.weekLabel}
                        </text>
                      );
                    })}
                  </g>
                </svg>
              )}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Donation by Category</h2>

            <div className="mt-7 flex items-center justify-center">
              <div
                className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full"
                style={{ background: conicGradient }}
              >
                <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-[16px] font-extrabold text-[#382b28]">Total</span>
                  <span className="mt-1 text-[13px] font-bold text-[#8d7d78]">
                    {formatCurrency(totalCat)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {categoryBreakdown.length === 0 ? (
                <p className="text-[13px] text-[#84716b]">No data.</p>
              ) : (
                categoryBreakdown.map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between text-[13px] font-medium text-[#6f605c]">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      {c.category}
                    </span>
                    <span className="font-bold text-[#433330]">{c.percentage}%</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[28px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-4 border-b border-[#f4ebea] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Detailed Transaction Report</h2>
            <div className="flex h-11 w-full items-center gap-2 rounded-full bg-[#faf7f5] px-4 sm:max-w-[260px]">
              <Search size={15} className="text-[#b5a8a4]" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-7 py-4">Date</th>
                  <th className="px-4 py-4">Donor Name</th>
                  <th className="px-4 py-4">Campaign</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Payment Method</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-7 py-10 text-center text-[14px] text-[#84716b]">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-[#f4ebea]">
                      <td className="px-7 py-5 text-[13px] font-medium text-[#6f605c]">{formatDate(t.purchasedAt)}</td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fde8e5] text-[10px] font-extrabold text-[#c86a5d]">
                            {t.donorInitials}
                          </div>
                          <span className="text-[14px] font-bold text-[#3b2f2c]">{t.donorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">{t.campaignTitle}</td>
                      <td className="px-4 py-5 text-[14px] font-extrabold text-[#c86a5d]">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-5">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-[#6f605c]">
                          <CreditCard size={14} />
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${STATUS_CLASS[t.status.toLowerCase()] ?? STATUS_CLASS.pending}`}>
                          {t.status.toLowerCase() === 'pending' ? 'DRAFT' : t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <button type="button" className="text-[#9d8f8a]">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">
              Showing {totalTransactions === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions.toLocaleString()} transactions
            </p>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) })
                .map((_, i) => {
                  let startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);
                  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                  return startPage + i;
                })
                .filter((p) => p <= totalPages)
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePage(page)}
                    disabled={isPending}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-[#b55247] text-white'
                        : 'border border-[#efdfdb] text-[#8c7d78] hover:bg-[#f7f4f3]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <div className="pt-10 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#c2b6b2]">
          (c) 2023 HOPECARD Mission Management System. All rights reserved.
        </div>
      </div>
    </AppShell>
  );
}
