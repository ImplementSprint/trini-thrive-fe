'use client';

import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CM_BACKEND_URL}/api/v1/hopecard/cm/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          target_amount: parseFloat(targetAmount) || 0,
          status: 'draft',
        }),
      });

      if (!response.ok) throw new Error('Failed to create campaign');
      
      // Reset form
      setTitle('');
      setDescription('');
      setTargetAmount('');
      
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[75vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-3xl font-bold text-[#1B1C1B]">Create Initiative</h2>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-lg transition text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Campaign Cover Photo */}
          <div>
            <label className="block text-base font-bold text-[#1B1C1B] mb-3">
              Campaign Cover Photo
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-16 text-center transition ${
                isDragging 
                  ? 'border-[#F28D83] bg-[#F28D83]/5' 
                  : 'border-gray-300 hover:border-[#F28D83] bg-gray-50'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F28D83]/10 rounded-full flex items-center justify-center">
                <ImageIcon size={32} className="text-[#F28D83]" />
              </div>
              <p className="text-[#1B1C1B] font-semibold mb-1">
                Drag & Drop image here
              </p>
              <p className="text-sm text-gray-400">
                or click to browse from your computer
              </p>
            </div>
          </div>

          {/* Initiative Name */}
          <div>
            <label className="block text-base font-bold text-[#1B1C1B] mb-3">
              Initiative Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28D83] focus:border-transparent text-[#1B1C1B] placeholder:text-gray-400"
              placeholder="e.g. Community Clean Water Project"
            />
          </div>

          {/* Target Funding Goal */}
          <div>
            <label className="block text-base font-bold text-[#1B1C1B] mb-1">
              Target Funding Goal
            </label>
            <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide">PHP</div>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">₱</span>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28D83] focus:border-transparent text-[#1B1C1B] text-lg placeholder:text-gray-400"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Beneficiary & Impact Details */}
          <div>
            <label className="block text-base font-bold text-[#1B1C1B] mb-3">
              Beneficiary & Impact Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28D83] focus:border-transparent text-[#1B1C1B] resize-none placeholder:text-gray-400"
              placeholder="Describe who this helps and what the funds will be used for..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-white border-2 border-gray-200 text-[#1B1C1B] rounded-xl font-semibold hover:bg-gray-50 transition text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 gradient-salmon text-white rounded-xl font-semibold hover:opacity-90 transition shadow-md text-base"
            >
              Publish Initiative
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
