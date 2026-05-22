import React from 'react';
import { Users, Calendar, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  title: string;
  beneficiary: string;
  raised: number;
  goal: number;
  donors: number;
  endDate: string;
  status: 'Active' | 'Pending' | 'Completed';
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const raised = campaign?.raised ?? 0;
  const goal = campaign?.goal ?? 0;
  const donors = campaign?.donors ?? 0;
  const status = campaign?.status ?? 'Pending';

  const progressPercentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  const statusStyles = {
    Active: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Completed: 'bg-gray-200 text-gray-600',
  };

  const handleViewDetails = () => {
    router.push(`/campaign/${campaign.id}`);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E5E2E1]">
      {/* Hero Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#F28D83] to-[#D47A73]">
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${statusStyles[status]} text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide`}>
            {status}
          </span>
        </div>
        {/* Arrow Icon */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ArrowUpRight size={16} className="text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-base font-bold text-[#1B1C1B] hover:text-[#97453E] mb-1 tracking-tight transition-colors cursor-pointer leading-tight">
          {campaign?.title || "Untitled Campaign"}
        </h3>
        
        {/* Beneficiary */}
        <p className="text-xs text-[#877270] mb-4">
          For: {campaign?.beneficiary || "Not specified"}
        </p>

        {/* Amount and Progress */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xl font-bold text-[#97453E]">
              ₱{raised.toLocaleString('en-PH')}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
            <div 
              className="bg-[#F28D83] h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="text-[10px] text-gray-400 text-right uppercase tracking-wide">
            GOAL: ₱{goal.toLocaleString('en-PH')}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[#F28D83]" />
            <span>{donors} Donors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-[#F28D83]" />
            <span>{campaign?.endDate || 'TBD'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleViewDetails}
            className="flex-1 bg-white border border-gray-200 text-[#1B1C1B] text-sm font-bold py-2.5 rounded-xl hover:bg-gray-50 transition"
          >
            View Details
          </button>
          <button className="flex-1 bg-[#F28D83]/10 text-[#97453E] text-sm font-bold py-2.5 rounded-xl hover:bg-[#F28D83]/20 transition">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
