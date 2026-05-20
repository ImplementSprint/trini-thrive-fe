import React from 'react';

export default function AdminApprovalModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[#E7D6D3] rounded-3xl p-10 w-full max-w-sm shadow-xl text-center">
        <p className="text-[#62312A] text-lg font-medium mb-6">Wait for Admin Approval</p>
        <button onClick={onClose} className="bg-[#A4C0D4] text-[#62312A] text-sm font-semibold px-6 py-2 rounded-xl transition hover:opacity-90">
          OK
        </button>
      </div>
    </div>
  );
}