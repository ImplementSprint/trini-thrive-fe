'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, FileEdit, Plus, Search, TrendingUp, UserPlus, Users, XCircle } from 'lucide-react';
import AppShell from '@/campaign-manager-components/AppShell';
import { activateCampaignAction, completeCampaignAction, cancelCampaignAction, changeCampaignToDraftAction, inviteBeneficiariesToCampaignAction, getApprovedBeneficiaries, getCampaignBeneficiaryIds } from '@/app/(campaign-manager)/campaign-manager/actions/campaign';
import type { MyCampaignRow } from '@/app/(campaign-manager)/campaign-manager/actions/reports';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  active: { label: 'ACTIVE', className: 'bg-[#ddf7e8] text-[#3caa71]' },
  draft: { label: 'DRAFT', className: 'bg-[#ffe7d7] text-[#e38f4d]' },
  completed: { label: 'COMPLETED', className: 'bg-[#ddf7e8] text-[#3caa71]' },
  cancelled: { label: 'CANCELLED', className: 'bg-[#fde8e5] text-[#c86a5d]' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
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

export default function MyCampaignsUI({
  campaigns,
  totalCount,
  currentPage,
  managerName,
}: {
  campaigns: MyCampaignRow[];
  totalCount: number;
  currentPage: number;
  managerName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const activeFilter = searchParams.get('status') ?? 'all';
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCampaignId, setInviteCampaignId] = useState<string | null>(null);
  const [allBeneficiaries, setAllBeneficiaries] = useState<any[]>([]);
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);


  function navigate(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.push(`/campaign-manager/my-campaigns?${next.toString()}`));
  }

  function handleFilterChange(filter: string) {
    navigate({ status: filter === 'all' ? '' : filter, page: '1' });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchInput, page: '1' });
  }

  function handlePage(p: number) {
    navigate({ page: p.toString() });
  }

  async function handleChangeToDraft() {
    if (selectedCampaignId) {
      const res = await changeCampaignToDraftAction(selectedCampaignId);
      if (!res) {
        setShowDraftDialog(false);
        setSelectedCampaignId(null);
        router.refresh();
      } else {
        alert(res.error || 'Failed to change status to draft');
      }
    }
  }

  async function openInviteModal(campaignId: string) {
    setInviteCampaignId(campaignId);
    setSelectedBeneficiaryIds([]);
    setInviteLoading(true);
    setShowInviteModal(true);
    const [allRes, assignedRes] = await Promise.all([
      getApprovedBeneficiaries(),
      getCampaignBeneficiaryIds(campaignId),
    ]);
    const assignedIds = new Set(assignedRes.success ? (assignedRes.data ?? []) : []);
    const available = (allRes.data ?? []).filter((b: any) => !assignedIds.has(b.id));
    setAllBeneficiaries(available);
    setInviteLoading(false);
  }

  async function handleInviteSubmit() {
    if (!inviteCampaignId || selectedBeneficiaryIds.length === 0) return;
    setInviteLoading(true);
    const res = await inviteBeneficiariesToCampaignAction(inviteCampaignId, selectedBeneficiaryIds);
    setInviteLoading(false);
    if (!res) {
      setShowInviteModal(false);
      setInviteCampaignId(null);
      router.refresh();
    } else {
      alert(res.error || 'Failed to invite beneficiaries');
    }
  }

  function toggleBeneficiary(id: string) {
    setSelectedBeneficiaryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }


  const filterTabs = [
    { label: 'All Campaigns', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <AppShell userName={managerName} userRole="Campaign Manager" searchPlaceholder="Search campaigns...">
      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Campaign Management</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#84716b]">
              Track, manage, and scale your active social impact initiatives from one centralized editorial dashboard.
            </p>
          </div>
          <Link
            href="/campaign-manager/create-campaign"
            className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-7 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] hover:bg-[#a0483e] transition-colors"
          >
            <Plus size={18} />
            Launch New Campaign
          </Link>
        </div>

        <section className="rounded-[28px] bg-white p-4 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-4 px-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-[12px] font-bold">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleFilterChange(tab.value)}
                  className={`rounded-xl px-4 py-2 transition-colors ${
                    activeFilter === tab.value
                      ? 'bg-[#fff1ed] text-[#cc6d58]'
                      : 'text-[#8a7b76] hover:bg-[#f7f4f3]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex h-11 w-full items-center gap-2 rounded-full bg-[#faf7f5] px-4 sm:max-w-[320px]">
              <Search size={15} className="text-[#b5a8a4]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search campaign name..."
                className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
              />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-4 py-4">Campaign Manager</th>
                  <th className="px-4 py-4">Campaign Name</th>
                  <th className="px-4 py-4">Beneficiary</th>
                  <th className="px-4 py-4">Amount Allocated</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[14px] text-[#84716b]">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => {
                    const statusInfo = STATUS_LABEL[campaign.status] ?? STATUS_LABEL.draft;
                    const initials = getInitials(managerName);
                    return (
                      <tr key={campaign.id} className="border-b border-[#f4ebea]">
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102f4c] text-[10px] font-extrabold text-white">
                              {initials}
                            </div>
                            <span className="text-[14px] font-semibold text-[#4a3936]">{managerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-[34px] w-[34px] rounded-lg bg-[#f7f4f3] flex items-center justify-center text-[10px] font-bold text-[#8a7a75]">
                              {getInitials(campaign.title)}
                            </div>
                            <span className="max-w-[170px] text-[14px] font-bold leading-[1.3] text-[#3b2f2c]">
                              {campaign.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-[14px] font-medium text-[#766762]">{campaign.beneficiaryName || '—'}</td>
                        <td className="px-4 py-5 text-[14px] font-bold text-[#453633]">{formatCurrency(campaign.targetAmount)}</td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2">
                            {(campaign.status === 'draft' || campaign.status === 'Draft') && (
                              <button
                                title="Activate Campaign"
                                type="button"
                                onClick={async () => {
                                  if (confirm('Are you sure you want to activate this campaign?')) {
                                    const res = await activateCampaignAction(campaign.id.toString());
                                    if (!res) router.refresh();
                                    else alert(res.error || 'Failed to activate');
                                  }
                                }}
                                className="rounded-lg bg-[#b55247] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#a0483e]"
                              >
                                Activate
                              </button>
                            )}
                            {(campaign.status === 'active' || campaign.status === 'Active') && (
                              <>
                                <button
                                  title="Complete Campaign"
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Mark this campaign as completed?')) {
                                      const res = await completeCampaignAction(campaign.id.toString());
                                      if (!res) router.refresh();
                                      else alert(res.error || 'Failed to complete');
                                    }
                                  }}
                                  className="rounded-lg bg-[#3caa71] p-1.5 text-white hover:bg-[#328e5e]"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                                <button
                                  title="Cancel Campaign"
                                  type="button"
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to cancel this campaign?')) {
                                      const res = await cancelCampaignAction(campaign.id.toString());
                                      if (!res) router.refresh();
                                      else alert(res.error || 'Failed to cancel');
                                    }
                                  }}
                                  className="rounded-lg bg-[#c86a5d] p-1.5 text-white hover:bg-[#a6564a]"
                                >
                                  <XCircle size={14} />
                                </button>
                                <button
                                  title="Return to Draft"
                                  type="button"
                                  onClick={() => {
                                    setSelectedCampaignId(campaign.id.toString());
                                    setShowDraftDialog(true);
                                  }}
                                  className="rounded-lg bg-[#e38f4d] p-1.5 text-white hover:bg-[#c97c3a]"
                                >
                                  <FileEdit size={14} />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              title="Invite Beneficiary"
                              onClick={() => openInviteModal(campaign.id.toString())}
                              className="rounded-lg bg-[#b55247] p-1.5 text-white hover:bg-[#a0483e]"
                            >
                              <UserPlus size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} campaigns
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

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1ed] text-[#cc6d58]">
                <TrendingUp size={16} />
              </div>
              <h2 className="text-[16px] font-extrabold text-[#433330]">Total Campaigns</h2>
            </div>
            <p className="mt-5 text-[40px] font-extrabold tracking-[-0.04em] text-[#ba5f4e]">{totalCount}</p>
            <p className="mt-2 text-[13px] leading-6 text-[#8b7d78]">Campaigns created by you</p>
          </section>

          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff6db] text-[#b9922e]">
                <Users size={16} />
              </div>
              <h2 className="text-[16px] font-extrabold text-[#433330]">Active Now</h2>
            </div>
            <p className="mt-5 text-[40px] font-extrabold tracking-[-0.04em] text-[#b9922e]">
              {campaigns.filter((c) => c.status === 'active').length}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#8b7d78]">Currently active campaigns</p>
          </section>

          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <h2 className="text-[16px] font-extrabold text-[#433330]">Campaign Tip</h2>
            <p className="mt-4 text-[14px] leading-7 text-[#8b7d78]">
              Visual updates increase donor retention by 42%. Try adding a cover photo to your next campaign.
            </p>
            <Link href="/campaign-manager/create-campaign" className="mt-5 block text-[12px] font-extrabold uppercase tracking-[0.06em] text-[#c96a5b]">
              Create Campaign →
            </Link>
          </section>
        </div>
      </div>

      {showInviteModal && inviteCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d201d]/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(61,34,29,0.18)]">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#352826]">Invite Beneficiary</h2>
                <p className="mt-1 text-[13px] text-[#87736e]">Choose one or more approved beneficiaries to invite to this campaign.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowInviteModal(false); setInviteCampaignId(null); }}
                className="text-[#a18e89]"
              >
                ✕
              </button>
            </div>

            {inviteLoading ? (
              <p className="py-6 text-center text-[14px] text-[#84716b]">Loading beneficiaries…</p>
            ) : allBeneficiaries.length === 0 ? (
              <p className="py-6 text-center text-[14px] text-[#84716b]">All approved beneficiaries are already assigned to this campaign.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {allBeneficiaries.map((b) => {
                  const selected = selectedBeneficiaryIds.includes(b.id);
                  const initials = getInitials(`${b.first_name} ${b.last_name}`);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBeneficiary(b.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                        selected
                          ? 'bg-[#fff1ed] ring-1 ring-[#e08069]'
                          : 'bg-[#faf7f5] hover:bg-[#f5efec]'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                        selected ? 'bg-[#b55247] text-white' : 'bg-[#e8deda] text-[#7a6560]'
                      }`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#3b2f2c]">{b.first_name} {b.last_name}</p>
                        {b.email && <p className="text-[12px] text-[#9a8984] truncate">{b.email}</p>}
                      </div>
                      {selected && (
                        <CheckCircle2 size={16} className="shrink-0 text-[#b55247]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowInviteModal(false); setInviteCampaignId(null); }}
                className="rounded-full border border-[#eedfdb] px-5 py-2.5 text-[13px] font-bold text-[#7b6763]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInviteSubmit}
                disabled={selectedBeneficiaryIds.length === 0 || inviteLoading}
                className="flex items-center gap-2 rounded-full bg-[#b55247] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] hover:bg-[#a0483e] disabled:opacity-50"
              >
                <UserPlus size={14} />
                Invite {selectedBeneficiaryIds.length > 0 ? `(${selectedBeneficiaryIds.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDraftDialog && selectedCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d201d]/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(61,34,29,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#352826]">Change Campaign to Draft</h2>
                <p className="mt-2 text-[14px] leading-6 text-[#87736e]">
                  Changing an Active campaign to Draft will pause it and make it unavailable to donors. This action can be reversed by reactivating the campaign.
                  <br />
                  <br />
                  <strong>Are you sure you want to proceed?</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDraftDialog(false);
                  setSelectedCampaignId(null);
                }}
                className="text-[#a18e89]"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDraftDialog(false);
                  setSelectedCampaignId(null);
                }}
                className="rounded-full border border-[#eedfdb] px-5 py-2.5 text-[13px] font-bold text-[#7b6763]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangeToDraft}
                disabled={!selectedCampaignId}
                className="rounded-full bg-[#b55247] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] hover:bg-[#a0483e] disabled:opacity-50"
              >
                Change to Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
