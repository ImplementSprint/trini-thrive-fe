"use client";
import React, { useState } from "react";

interface SiteManagerProfilePageProps {
  onBack: () => void;
  primaryColor: string;
}

export default function SiteManagerProfilePage({ onBack, primaryColor }: SiteManagerProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Site Manager",
    email: "manager.visayas@damayan.gov.ph",
    mobile: "+63 917 123 4567",
    cluster: "Central Visayas Cluster",
    employeeId: "SM-CV-2026-04",
    emergencyContactName: "Damayan Regional HQ",
    emergencyContactMobile: "+63 2 8888 9999",
  });

  const handleSave = () => {
    setIsEditing(false);
    // API call would go here
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl space-y-10 py-6">
      <div className="flex justify-between items-end">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-[#444743] dark:text-[#c4c7c0] text-sm font-bold mb-8 hover:text-[#1a1c19] dark:hover:text-white transition-colors group">
            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Dashboard
          </button>
          <h2 className="text-4xl font-black tracking-tight text-[#1a1c19] dark:text-white">Manager Profile</h2>
          <p className="text-[#444743] dark:text-[#c4c7c0] font-medium mt-3 text-lg opacity-80">Manage your operational credentials and contact information.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-colors"
            style={{ color: primaryColor, backgroundColor: primaryColor + "15" }}
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            Edit Details
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-lg transition-colors hover:brightness-90"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="material-symbols-outlined text-xl">save</span>
            Save Changes
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#232622] rounded-[2.5rem] p-10 border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm space-y-10">
        
        {/* Operational Information */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-[#dadad5] dark:border-[#3b3b3b] pb-4">
            <span className="material-symbols-outlined" style={{ color: primaryColor }}>badge</span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444743] dark:text-[#a0a39f]">Operational Credentials</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444743] dark:text-[#c4c7c0] ml-1">Full Name</label>
              <input 
                value={profileData.fullName}
                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#f4f4ef] dark:bg-[#2e312d] text-[#1a1c19] dark:text-white font-bold focus:outline-none transition-colors disabled:opacity-70 disabled:bg-transparent" 
                style={{ outlineColor: primaryColor } as any}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444743] dark:text-[#c4c7c0] ml-1">Assigned Cluster</label>
              <input 
                value={profileData.cluster}
                disabled={true}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#f4f4ef] dark:bg-[#2e312d] text-[#1a1c19] dark:text-white font-bold focus:outline-none transition-colors opacity-50 cursor-not-allowed" 
                title="Cluster assignment cannot be changed manually."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444743] dark:text-[#c4c7c0] ml-1">Employee ID</label>
              <input 
                value={profileData.employeeId}
                disabled={true}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#f4f4ef] dark:bg-[#2e312d] text-[#1a1c19] dark:text-white font-bold focus:outline-none transition-colors opacity-50 cursor-not-allowed" 
                title="Employee ID cannot be changed."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444743] dark:text-[#c4c7c0] ml-1">Email Address</label>
              <input 
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#f4f4ef] dark:bg-[#2e312d] text-[#1a1c19] dark:text-white font-bold focus:outline-none transition-colors disabled:opacity-70 disabled:bg-transparent" 
                style={{ outlineColor: primaryColor } as any}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444743] dark:text-[#c4c7c0] ml-1">Mobile Number</label>
              <input 
                value={profileData.mobile}
                onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#f4f4ef] dark:bg-[#2e312d] text-[#1a1c19] dark:text-white font-bold focus:outline-none transition-colors disabled:opacity-70 disabled:bg-transparent" 
                style={{ outlineColor: primaryColor } as any}
              />
            </div>
          </div>
        </div>

        {/* HQ Contact */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-[#dadad5] dark:border-[#3b3b3b] pb-4">
            <span className="material-symbols-outlined text-[#FFB300]">domain</span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444743] dark:text-[#a0a39f]">HQ Emergency Contact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444743] dark:text-[#c4c7c0] ml-1">HQ Name</label>
              <input 
                value={profileData.emergencyContactName}
                onChange={(e) => setProfileData({...profileData, emergencyContactName: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#f4f4ef] dark:bg-[#2e312d] text-[#1a1c19] dark:text-white font-bold focus:outline-none transition-colors disabled:opacity-70 disabled:bg-transparent" 
                style={{ outlineColor: primaryColor } as any}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444743] dark:text-[#c4c7c0] ml-1">HQ Contact Number</label>
              <input 
                value={profileData.emergencyContactMobile}
                onChange={(e) => setProfileData({...profileData, emergencyContactMobile: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#f4f4ef] dark:bg-[#2e312d] text-[#1a1c19] dark:text-white font-bold focus:outline-none transition-colors disabled:opacity-70 disabled:bg-transparent" 
                style={{ outlineColor: primaryColor } as any}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
