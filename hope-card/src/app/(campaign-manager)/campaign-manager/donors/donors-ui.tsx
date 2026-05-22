'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CircleDollarSign,
  Download,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import AppShell from '@/campaign-manager-components/AppShell';
import type { DonorStatCards, DonorRow } from '@/app/(campaign-manager)/campaign-manager/actions/reports';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const TIER_COLOR: Record<string, string> = {
  'VIP DONOR': 'text-[#b7962c]',
  'MAJOR GIFT': 'text-[#b7962c]',
  RECURRING: 'text-[#d06f5b]',
  STANDARD: 'text-[#8f817d]',
};

function DonorProfileModal({ donor, onClose }: { donor: DonorRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white shadow-[0_24px_60px_rgba(87,55,48,0.18)] ring-1 ring-[#f0e7e3]">
        <div className="flex items-start justify-between border-b border-[#f4ebea] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fde8e5] text-[14px] font-extrabold text-[#c86a5d]">
              {getInitials(donor.name)}
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-[#2e2523]">{donor.name}</h2>
              <p className={`text-[11px] font-extrabold uppercase tracking-[0.05em] ${TIER_COLOR[donor.tier] ?? 'text-[#8f817d]'}`}>
                {donor.tier}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f4f3] text-[#9d8f8a] hover:bg-[#f0e7e3] transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-3 text-[14px] text-[#6f605c]">
            <Mail size={15} className="shrink-0 text-[#c86a5d]" />
            <span>{donor.email || '—'}</span>
          </div>
          {donor.phone && (
            <div className="flex items-center gap-3 text-[14px] text-[#6f605c]">
              <Phone size={15} className="shrink-0 text-[#c86a5d]" />
              <span>{donor.phone}</span>
            </div>
          )}
          {donor.address && (
            <div className="flex items-center gap-3 text-[14px] text-[#6f605c]">
              <MapPin size={15} className="shrink-0 text-[#c86a5d]" />
              <span>{donor.address}</span>
            </div>
          )}

          <div className="mt-2 grid grid-cols-3 gap-3 rounded-[18px] bg-[#faf7f5] p-4">
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">Contributed</p>
              <p className="mt-1 text-[14px] font-extrabold text-[#c86a5d]">{formatCurrency(donor.totalContributed)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">Donations</p>
              <p className="mt-1 text-[14px] font-extrabold text-[#382b28]">{donor.donationCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">Last Gift</p>
              <p className="mt-1 text-[12px] font-bold text-[#6f605c]">{formatDate(donor.lastDonationDate)}</p>
            </div>
          </div>

          {donor.campaignTags.length > 0 && (
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">Last Campaign</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {donor.campaignTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#fde8e5] px-3 py-1 text-[11px] font-bold text-[#c86a5d]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {donor.preferredPaymentMethod && (
            <div className="flex items-center justify-between text-[13px] text-[#6f605c]">
              <span className="font-semibold text-[#9b8d88]">Preferred Payment</span>
              <span className="font-bold text-[#382b28]">{donor.preferredPaymentMethod}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DonorsUI({
  statCards,
  donors,
  totalCount,
  currentPage,
  managerName,
  search: initialSearch = '',
}: {
  statCards: DonorStatCards;
  donors: DonorRow[];
  totalCount: number;
  currentPage: number;
  managerName?: string;
  search?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedDonor, setSelectedDonor] = useState<DonorRow | null>(null);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  function navigate(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    startTransition(() => router.push(`/campaign-manager/donors?${next.toString()}`));
  }

  function handlePage(p: number) {
    navigate({ page: p.toString() });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchInput, page: '1' });
  }

  const statCardData = [
    {
      icon: Users,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: '+12%',
      badgeClass: 'text-[#c86a5d]',
      title: 'Total Unique Donors',
      value: statCards.totalUniqueDonors.toLocaleString(),
    },
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fff3d5]',
      iconColor: 'text-[#bb9432]',
      badge: `Target: $150`,
      badgeClass: 'text-[#bb9432]',
      title: 'Average Donation',
      value: formatCurrency(statCards.averageDonation),
    },
    {
      icon: UserPlus,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: 'New',
      badgeClass: 'text-[#c86a5d]',
      title: 'New Donors This Month',
      value: statCards.newDonorsThisMonth.toLocaleString(),
    },
  ];

  return (
    <AppShell userName={managerName} userRole="Campaign Manager" searchPlaceholder="Search donors...">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Donors Database</h1>
            <p className="mt-2 text-[15px] text-[#84716b]">
              Managing {totalCount.toLocaleString()} contributors across your campaigns.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#5d4c48] shadow-[0_12px_30px_rgba(87,55,48,0.06)] ring-1 ring-[#f0e7e3]"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
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

        <section className="rounded-[28px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-3 border-b border-[#f4ebea] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Community Database</h2>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="flex h-10 items-center gap-2 rounded-full bg-[#faf7f5] px-4 ring-1 ring-[#f0e7e3]">
                <Search size={14} className="text-[#b5a8a4]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-[200px] bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
                />
              </form>
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#8c7c77]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c85d50]" />
                Live sync active
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-7 py-4">Donor Name</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Total Contributed</th>
                  <th className="px-4 py-4">Last Donation</th>
                  <th className="px-4 py-4">Campaigns</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-7 py-10 text-center text-[14px] text-[#84716b]">
                      {initialSearch ? `No donors found matching "${initialSearch}".` : 'No donors found.'}
                    </td>
                  </tr>
                ) : (
                  donors.map((donor) => (
                    <tr key={donor.id} className="border-b border-[#f4ebea] hover:bg-[#fdfaf9] transition-colors">
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fde8e5] text-[11px] font-extrabold text-[#c86a5d]">
                            {getInitials(donor.name)}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold leading-[1.2] text-[#3b2f2c]">{donor.name}</p>
                            <p className={`mt-1 text-[10px] font-extrabold uppercase tracking-[0.05em] ${TIER_COLOR[donor.tier] ?? 'text-[#8f817d]'}`}>
                              {donor.tier}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">{donor.email}</td>
                      <td className="px-4 py-5 text-[14px] font-bold text-[#433330]">
                        {formatCurrency(donor.totalContributed)}
                      </td>
                      <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">
                        {formatDate(donor.lastDonationDate)}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          {donor.campaignTags.length === 0 ? (
                            <span className="text-[12px] text-[#b8aca8]">—</span>
                          ) : (
                            donor.campaignTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[#f4f1ef] px-3 py-1 text-[10px] font-extrabold uppercase text-[#6e5f5b]"
                              >
                                {tag}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <button
                          type="button"
                          onClick={() => setSelectedDonor(donor)}
                          className="rounded-full bg-[#fde8e5] px-3 py-1.5 text-[11px] font-bold text-[#c86a5d] hover:bg-[#fbd0cc] transition"
                        >
                          View
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
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount.toLocaleString()} donors
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

        <div className="flex items-center justify-center pb-6 pt-2 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#c2b6b2]">
          (c) 2023 HOPECARD Mission Management System. All rights reserved.
        </div>
      </div>

      {selectedDonor && (
        <DonorProfileModal donor={selectedDonor} onClose={() => setSelectedDonor(null)} />
      )}
    </AppShell>
  );
}
