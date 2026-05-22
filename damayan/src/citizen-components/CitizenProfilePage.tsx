"use client";
import React, { useState } from "react";

interface CitizenProfilePageProps {
  onBack: () => void;
}

export default function CitizenProfilePage({ onBack }: CitizenProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Elena Villacruz",
    email: "elena.v@example.com",
    mobile: "+63 912 345 6789",
    address: "Brgy. 102, Dist 4, Central Visayas",
    bloodType: "O+",
    allergies: "None",
    emergencyContactName: "Juan Villacruz",
    emergencyContactMobile: "+63 998 765 4321",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Usually an API call would go here
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-10 py-6">
      <div className="flex justify-between items-end">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-[#444941] dark:text-[#c4c7c0] text-sm font-bold mb-8 hover:text-[#1A1C19] dark:hover:text-white transition-colors group">
            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span> Back
          </button>
          <h2 className="text-4xl font-black tracking-tight text-[#1A1C19] dark:text-white">Your Profile</h2>
          <p className="text-[#444941] dark:text-[#c4c7c0] font-medium mt-3 text-lg opacity-80">Manage your personal and emergency contact information.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-[#2E7D32] bg-[#E8F5E9] dark:bg-[#2E7D32]/20 hover:bg-[#C8E6C9] dark:hover:bg-[#2E7D32]/40 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            Edit Profile
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-[#2E7D32] shadow-lg hover:bg-[#1B5E20] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">save</span>
            Save Changes
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#232622] rounded-[2.5rem] p-10 border border-[#dadad5] dark:border-[#3b3b3b] shadow-sm space-y-10">
        
        {/* Basic Information */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-[#dadad5] dark:border-[#3b3b3b] pb-4">
            <span className="material-symbols-outlined text-[#2E7D32]">person</span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707a6c] dark:text-[#a0a39f]">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Full Name</label>
              <input 
                value={profileData.fullName}
                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Email Address</label>
              <input 
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Mobile Number</label>
              <input 
                value={profileData.mobile}
                onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Home Address</label>
              <input 
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-[#dadad5] dark:border-[#3b3b3b] pb-4">
            <span className="material-symbols-outlined text-red-500">medical_services</span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707a6c] dark:text-[#a0a39f]">Medical Profile</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Blood Type</label>
              <input 
                value={profileData.bloodType}
                onChange={(e) => setProfileData({...profileData, bloodType: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Known Allergies</label>
              <input 
                value={profileData.allergies}
                onChange={(e) => setProfileData({...profileData, allergies: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-[#dadad5] dark:border-[#3b3b3b] pb-4">
            <span className="material-symbols-outlined text-[#FFB300]">contact_phone</span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#707a6c] dark:text-[#a0a39f]">Emergency Contact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Contact Name</label>
              <input 
                value={profileData.emergencyContactName}
                onChange={(e) => setProfileData({...profileData, emergencyContactName: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#444941] dark:text-[#c4c7c0] ml-1">Contact Number</label>
              <input 
                value={profileData.emergencyContactMobile}
                onChange={(e) => setProfileData({...profileData, emergencyContactMobile: e.target.value})}
                disabled={!isEditing}
                className="w-full px-6 py-4 rounded-2xl border-2 border-[#dadad5] dark:border-[#3b3b3b] bg-[#F5F7F5] dark:bg-[#2e312d] text-[#1A1C19] dark:text-white font-bold focus:outline-none focus:border-[#2E7D32] transition-colors disabled:opacity-70 disabled:bg-transparent" 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
