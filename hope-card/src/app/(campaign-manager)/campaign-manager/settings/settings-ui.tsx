'use client';

import { useState, useRef, useTransition } from 'react';
import { BellDot, ChevronRight, CreditCard, ShieldCheck, UserRound, Eye, EyeOff } from 'lucide-react';
import AppShell from '@/campaign-manager-components/AppShell';
import { updateProfileAction } from '@/app/(campaign-manager)/campaign-manager/actions/auth';

const securityItems = [
  {
    title: 'Change Password',
    copy: 'Last changed 30 days ago',
    icon: ShieldCheck,
    accent: 'text-[#c86a5d]',
    bg: 'bg-[#fde8e5]',
    trailing: '',
  },
  {
    title: 'Two-Factor Auth',
    copy: 'Add an extra layer of security to your account.',
    icon: ShieldCheck,
    accent: 'text-[#b9922e]',
    bg: 'bg-[#fff3d5]',
    trailing: 'Enable 2FA Now >',
  },
];

const bankingItems = [
  {
    title: 'Chase Business Checking',
    account: '**** 8621',
    badge: 'VERIFIED',
    badgeClass: 'bg-[#fff6db] text-[#b9922e]',
    active: true,
  },
  {
    title: 'Foundation Savings',
    account: '**** 4430',
    badge: 'PENDING VERIFICATION',
    badgeClass: 'bg-[#f4f1ef] text-[#8f817d]',
    active: false,
  },
];

export default function SettingsUI({
  initialProfile,
}: {
  initialProfile: {
    first_name: string;
    last_name: string;
    email: string;
    bio: string | null;
    organization_name: string;
    phone: string;
  };
}) {
  const [profile, setProfile] = useState({
    firstName: initialProfile.first_name,
    lastName: initialProfile.last_name,
    email: initialProfile.email,
    bio: initialProfile.bio || '',
    organizationName: initialProfile.organization_name,
    phone: initialProfile.phone,
  });

  const [notifications, setNotifications] = useState({
    'Campaign Milestones': true,
    'New Donations': true,
    'Admin Messages': false,
  });

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeactivatePassword, setShowDeactivatePassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('bio', profile.bio);
      formData.append('organizationName', profile.organizationName);
      formData.append('phone', profile.phone);

      const res = await updateProfileAction(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
      }
    });
  };

  const userName = `${profile.firstName} ${profile.lastName}`;

  return (
    <AppShell userName={userName} userRole="Campaign Manager" searchPlaceholder="Search settings...">
      <div className="w-full space-y-6 pb-32">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Account Settings</h1>
          <p className="mt-2 text-[15px] text-[#84716b]">
            Manage your personal information, security preferences, and financial details.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Profile Settings</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex h-[42px] items-center justify-center rounded-full border border-[#f0e7e3] bg-white px-5 text-[13px] font-bold text-[#7d6a64] transition-colors hover:bg-[#faf7f5]"
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={!isEditingProfile || isPending}
                    className="flex h-[42px] items-center justify-center rounded-full bg-[#b55247] px-5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] transition-colors hover:bg-[#a0483e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-[160px_minmax(0,1fr)]">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-[22px] bg-[#294459] text-white">
                      <UserRound size={54} />
                    </div>
                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#c86a5d] shadow-[0_10px_22px_rgba(87,55,48,0.10)]"
                    >
                      <BellDot size={16} />
                    </button>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#8f817d] transition-colors hover:text-[#c86a5d]">
                    Update Photo
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={() => alert('Photo upload functionality not implemented yet.')} />
                </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputChip readOnly={!isEditingProfile} label="First Name" value={profile.firstName} onChange={(v) => setProfile({ ...profile, firstName: v })} />
                      <InputChip readOnly={!isEditingProfile} label="Last Name" value={profile.lastName} onChange={(v) => setProfile({ ...profile, lastName: v })} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputChip readOnly={!isEditingProfile} label="Organization" value={profile.organizationName} onChange={(v) => setProfile({ ...profile, organizationName: v })} />
                      <InputChip readOnly={!isEditingProfile} label="Contact Number" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                    </div>
                    <InputChip readOnly={true} label="Email Address" value={profile.email} onChange={() => {}} />
                    <InputArea
                      readOnly={!isEditingProfile}
                      label="Bio"
                      value={profile.bio}
                      onChange={(v) => setProfile({ ...profile, bio: v })}
                    />
                  </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[18px] font-extrabold text-[#382b28]">Banking &amp; Payouts</h2>
                  <p className="mt-1 text-[13px] text-[#8d7d78]">Linked accounts for fund disbursement</p>
                </div>
                <button type="button" onClick={() => setShowAddAccountModal(true)} className="text-[12px] font-bold text-[#c96a5b] transition-colors hover:text-[#a0483e]">
                  + Add Account
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {bankingItems.map((item) => (
                  <div key={item.title} className="flex flex-col gap-4 rounded-[22px] bg-[#faf7f5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          item.active ? 'bg-[#fff3d5] text-[#bb9432]' : 'bg-[#f0ece9] text-[#8f817d]'
                        }`}
                      >
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#3b2f2c]">{item.title}</p>
                        <p className="mt-1 text-[12px] font-medium text-[#8d7d78]">{item.account}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${item.badgeClass}`}>{item.badge}</span>
                      <button type="button" className="text-[#9d8f8a]">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Notifications</h2>

              <div className="mt-5 space-y-5">
                {Object.entries(notifications).map(([title, enabled]) => {
                  const copy = title === 'Campaign Milestones' 
                    ? 'Goal at 50% / 100% met' 
                    : title === 'New Donations' 
                      ? 'Instant alerts for every gift' 
                      : 'Critical system updates';
                  return (
                    <div key={title} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-bold text-[#433330]">{title}</p>
                        <p className="mt-1 text-[12px] text-[#8d7d78]">{copy}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, [title]: !enabled })}
                        className={`flex h-7 w-12 cursor-pointer items-center rounded-full px-1 transition-colors ${
                          enabled ? 'justify-end bg-[#fde8e5]' : 'justify-start bg-[#f0ece9]'
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full transition-transform ${enabled ? 'bg-[#ef8f86]' : 'bg-white shadow-[0_4px_10px_rgba(0,0,0,0.08)]'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Security</h2>

              <div className="mt-5 space-y-4">
                {securityItems.map(({ title, copy, icon: Icon, accent, bg, trailing }) => (
                  <div key={title} className="rounded-[22px] bg-[#faf7f5] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} ${accent}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#433330]">{title}</p>
                        <p className="mt-1 text-[12px] text-[#8d7d78]">{copy}</p>
                        {trailing ? <button type="button" className="mt-3 text-[11px] font-bold text-[#c96a5b]">{trailing}</button> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <div className="flex flex-col gap-8 pt-12">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowDeactivateModal(true)}
              className="flex h-[46px] items-center justify-center rounded-full bg-[#d72617] px-6 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(215,38,23,0.22)] transition-colors hover:bg-[#c22214]"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {showDeactivateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2e2523]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-[20px] font-extrabold text-[#382b28]">Deactivate Account</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#8d7d78]">
              Are you sure you want to deactivate your account? This action cannot be undone. Please enter your password to confirm.
            </p>
            <div className="relative mt-5">
              <input
                type={showDeactivatePassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full rounded-xl bg-[#f7f4f3] px-4 py-3 pr-10 text-[14px] text-[#5d4c48] outline-none focus:ring-2 focus:ring-[#f5ece8]"
              />
              <button type="button" onClick={() => setShowDeactivatePassword(!showDeactivatePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bcb3b0] hover:text-[#8f7f7b] transition">
                {showDeactivatePassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowDeactivateModal(false)} 
                className="rounded-full px-5 py-2.5 text-[13px] font-bold text-[#8d7d78] transition-colors hover:bg-[#f7f4f3]"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  alert('Account deactivation requested.');
                  setShowDeactivateModal(false);
                }} 
                className="rounded-full bg-[#d72617] px-6 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(215,38,23,0.22)] transition-colors hover:bg-[#c22214]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAccountModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2e2523]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-[20px] font-extrabold text-[#382b28]">Add Bank Account</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#8d7d78]">
              Enter your banking details to safely receive campaign payouts.
            </p>
            
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Cardholder Name</label>
                <input type="text" placeholder={userName} className="mt-2 w-full rounded-xl bg-[#f7f4f3] px-4 py-3 text-[14px] text-[#5d4c48] outline-none focus:ring-2 focus:ring-[#f5ece8]" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="mt-2 w-full rounded-xl bg-[#f7f4f3] px-4 py-3 text-[14px] text-[#5d4c48] outline-none focus:ring-2 focus:ring-[#f5ece8]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="mt-2 w-full rounded-xl bg-[#f7f4f3] px-4 py-3 text-[14px] text-[#5d4c48] outline-none focus:ring-2 focus:ring-[#f5ece8]" />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">CVC</label>
                  <input type="text" placeholder="123" className="mt-2 w-full rounded-xl bg-[#f7f4f3] px-4 py-3 text-[14px] text-[#5d4c48] outline-none focus:ring-2 focus:ring-[#f5ece8]" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowAddAccountModal(false)} 
                className="rounded-full px-5 py-2.5 text-[13px] font-bold text-[#8d7d78] transition-colors hover:bg-[#f7f4f3]"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  alert('Bank Account Added Successfully!');
                  setShowAddAccountModal(false);
                }} 
                className="rounded-full bg-[#b55247] px-6 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] transition-colors hover:bg-[#a0483e]"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function InputChip({ label, value, onChange, readOnly }: { label: string; value: string; onChange: (val: string) => void; readOnly?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">{label}</p>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        readOnly={readOnly}
        className={`mt-3 w-full rounded-[18px] bg-[#f7f4f3] px-5 py-4 text-[14px] font-medium text-[#5d4c48] outline-none transition-colors focus:ring-2 focus:ring-[#f5ece8] ${readOnly ? 'opacity-70 cursor-not-allowed hidden-selection' : ''}`} 
      />
    </div>
  );
}

function InputArea({ label, value, onChange, readOnly }: { label: string; value: string; onChange: (val: string) => void; readOnly?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">{label}</p>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        readOnly={readOnly}
        className={`mt-3 min-h-[108px] w-full resize-none rounded-[18px] bg-[#f7f4f3] px-5 py-4 text-[14px] leading-7 text-[#5d4c48] outline-none transition-colors focus:ring-2 focus:ring-[#f5ece8] ${readOnly ? 'opacity-70 cursor-not-allowed hidden-selection' : ''}`} 
      />
    </div>
  );
}
