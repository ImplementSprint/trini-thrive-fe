'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  beneficiary: string;
  raised: number;
  goal: number;
  donors: number;
  endDate: string;
  status: 'Active' | 'Draft' | 'Completed' | 'Cancelled';
  description?: string;
}

export default function CampaignDetails() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CM_BACKEND_URL}/api/campaigns`);
        if (!response.ok) throw new Error('Failed to fetch');

        const campaigns = await response.json();
        const found = campaigns.find((c: Campaign) => c.id === params.id);

        if (found) {
          setCampaign(found);
        } else {
          router.push('/campaign-manager/create-account');
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        router.push('/campaign-manager/create-account');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCF9F8] flex items-center justify-center">
        <div className="text-[#877270]">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) return null;

  const progressPercentage = campaign.goal > 0 ? Math.min((campaign.raised / campaign.goal) * 100, 100) : 0;

  const statusStyles = {
    Active: 'bg-emerald-500 text-white',
    Draft: 'bg-yellow-400 text-[#1B1C1B]',
    Completed: 'bg-emerald-500 text-white',
    Cancelled: 'bg-red-500 text-white',
  };

  return (
    <div className="min-h-screen bg-[#FCF9F8]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#97453E] text-white px-8 py-4 shadow-md z-50">
        <div className="w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/campaign-manager/images/logo_h.png" alt="HOPECARD" className="h-12 w-auto" />
            <span className="font-extrabold text-xl tracking-tight">HOPECARD</span>
          </div>

          <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 text-sm">
            <a href="/campaign-manager/dashboard" className="hover:text-white/80 font-medium border-b-2 border-white pb-1">Dashboard</a>
            <a href="#" className="hover:text-white/80 font-medium text-white/70">History</a>
            <a href="#" className="hover:text-white/80 font-medium text-white/70">Resources</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/campaign-manager/dashboard')}
              className="gradient-salmon text-white px-6 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition shadow-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 px-8 pb-12">
        <div className="w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/campaign-manager/dashboard')}
            className="flex items-center gap-2 text-[#877270] hover:text-[#97453E] mb-6 transition text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Campaigns</span>
          </button>

          {/* Campaign Details Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E5E2E1]">
            {/* Hero Image */}
            <div className="relative h-44 bg-gradient-to-br from-[#F28D83] to-[#D47A73]">
              <div className="absolute top-4 left-4">
                <span className={`${statusStyles[campaign.status]} text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider`}>
                  {campaign.status}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Main Information */}
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold leading-tight mb-2 text-[#1B1C1B]">
                    {campaign.title}
                  </h1>

                  <p className="text-sm mb-8">
                    <span className="text-[#877270]">Beneficiary: </span>
                    <span className="text-[#1B1C1B] font-bold">{campaign.beneficiary}</span>
                  </p>

                  <h2 className="text-base font-bold text-[#1B1C1B] mb-3">About this initiative</h2>
                  <p className="text-sm text-[#877270] leading-relaxed">
                    {campaign.description || 'This campaign aims to provide support and resources for ' + campaign.beneficiary + '. Your contributions will directly impact the lives of those involved, ensuring they have access to the necessary tools and assistance required to thrive. Every donation makes a significant difference in achieving our shared goal.'}
                  </p>
                </div>

                {/* Right Column - Sidebar Stats Card */}
                <div className="w-full lg:w-72 flex-shrink-0">
                  <div className="bg-[#FCF9F8] rounded-xl p-6">
                    {/* Funding Metrics */}
                    <div className="mb-6">
                      <div className="text-3xl font-extrabold text-[#97453E] mb-1">
                        ₱{campaign.raised.toLocaleString('en-PH')}
                      </div>
                      <div className="text-xs text-[#877270] uppercase tracking-wide mb-4">
                        RAISED OF ₱{campaign.goal.toLocaleString('en-PH')} GOAL
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500 bg-[#F28D83]"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        {progressPercentage.toFixed(0)}% funded
                      </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                          <Users size={18} className="text-[#F28D83]" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-[#1B1C1B]">{campaign.donors}</div>
                          <div className="text-xs text-[#877270]">Total Donors</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                          <Calendar size={18} className="text-[#F28D83]" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-[#1B1C1B]">{campaign.endDate}</div>
                          <div className="text-xs text-[#877270]">Target Date</div>
                        </div>
                      </div>
                    </div>

                    {/* Donate Button */}
                    <button className="w-full bg-[#F28D83] text-white font-bold text-base py-3 rounded-xl hover:opacity-90 transition">
                      Donate Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
