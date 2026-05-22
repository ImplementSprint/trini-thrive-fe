'use client';

import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  BriefcaseMedical,
  CalendarDays,
  Camera,
  Check,
  CheckSquare,
  CloudUpload,
  FileBadge2,
  FileCheck2,
  FileText,
  Flag,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  ImagePlus,
  List,
  Link2,
  MapPin,
  Mountain,
  Plus,
  Pencil,
  Building2,
  CheckCircle2,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  Square,
  Type,
  Undo2,
  UserSquare2,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/campaign-manager-components/AppShell';
import { getApprovedBeneficiaries, createCampaignAction } from '../actions/campaign';
const steps = [
  { number: 1, label: 'Basics' },
  { number: 2, label: 'Story' },
  { number: 3, label: 'Beneficiary' },
  { number: 4, label: 'Documents' },
  { number: 5, label: 'Review' },
] as const;

const categories = [
  { label: 'Health', icon: BriefcaseMedical },
  { label: 'Education', icon: GraduationCap },
  { label: 'Environment', icon: Mountain },
  { label: 'Disaster', icon: ShieldAlert },
];

interface ValidationError {
  field: string;
  message: string;
}

function validateCampaignForPublication(state: {
  title: string;
  activeCategory: string;
  description: string;
  targetAmount: string;
  endDate: string;
  selectedBeneficiaries: string[];
  managerId: File | null;
  proofOfAddress: File | null;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToCampaignAccuracy: boolean;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation
  if (!state.title || state.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Campaign title is required' });
  }

  // Category validation
  if (!state.activeCategory || state.activeCategory.trim().length === 0) {
    errors.push({ field: 'category', message: 'Please select a category' });
  }

  // Description validation
  if (!state.description || state.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Campaign description is required' });
  }

  // Target amount validation
  const targetAmount = parseFloat(state.targetAmount);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be greater than 0' });
  }

  // End date validation
  if (!state.endDate) {
    errors.push({ field: 'endDate', message: 'Campaign end date is required' });
  } else {
    const endDate = new Date(state.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate <= today) {
      errors.push({ field: 'endDate', message: 'End date must be in the future' });
    }
  }

  // Beneficiaries validation
  if (state.selectedBeneficiaries.length === 0) {
    errors.push({ field: 'beneficiaries', message: 'At least one beneficiary must be selected' });
  }

  // Documents validation
  if (!state.managerId || state.managerId.size === 0) {
    errors.push({ field: 'managerId', message: 'Manager ID document is required' });
  }

  if (!state.proofOfAddress || state.proofOfAddress.size === 0) {
    errors.push({ field: 'proofOfAddress', message: 'Proof of Address document is required' });
  }

  // Agreements validation
  if (!state.agreedToTerms) {
    errors.push({ field: 'agreements', message: 'You must agree to the Terms of Service' });
  }
  if (!state.agreedToPrivacy) {
    errors.push({ field: 'agreements', message: 'You must agree to the Privacy Policy' });
  }
  if (!state.agreedToCampaignAccuracy) {
    errors.push({ field: 'agreements', message: 'You must certify campaign accuracy' });
  }

  return errors;
}

export default function CreateCampaignUI({
  managerName,
}: {
  managerName?: string;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);

  // Basic Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Financial Form State
  const [targetAmount, setTargetAmount] = useState('');
  const [minDonation, setMinDonation] = useState('');
  const [endDate, setEndDate] = useState('');

  // Documents Form State
  const [managerId, setManagerId] = useState<File | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToCampaignAccuracy, setAgreedToCampaignAccuracy] = useState(false);

  // Clear validation errors when form fields change
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [title, activeCategory, description, targetAmount, endDate, selectedBeneficiaries, managerId, proofOfAddress, agreedToTerms, agreedToPrivacy, agreedToCampaignAccuracy]);

  useEffect(() => {
    async function fetchBen() {
      const res = await getApprovedBeneficiaries();
      if (res.success && res.data) {
        setBeneficiaries(res.data);
      }
    }
    fetchBen();
  }, []);

  const toggleBeneficiary = (id: string) => {
    setSelectedBeneficiaries(prev =>
      prev.includes(id) ? [] : [id]
    );
  };

  const handleSubmit = async () => {
    // Validate before submission
    const errors = validateCampaignForPublication({
      title,
      activeCategory,
      description,
      targetAmount,
      endDate,
      selectedBeneficiaries,
      managerId,
      proofOfAddress,
      agreedToTerms,
      agreedToPrivacy,
      agreedToCampaignAccuracy,
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', activeCategory);
    formData.append('description', description);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    formData.append('target_amount', targetAmount);
    // Suggestion: Skipping minDonation for backend saving currently since hc_campaigns does not have a dedicated slot
    formData.append('end_date', endDate);
    formData.append('selectedBeneficiaries', JSON.stringify(selectedBeneficiaries));

    // Documents
    if (managerId) {
      formData.append('managerId', managerId);
    }
    if (proofOfAddress) {
      formData.append('proofOfAddress', proofOfAddress);
    }
    formData.append('agreedToTerms', String(agreedToTerms));
    formData.append('agreedToPrivacy', String(agreedToPrivacy));
    formData.append('agreedToCampaignAccuracy', String(agreedToCampaignAccuracy));

    const res = await createCampaignAction(formData);
    setIsSubmitting(false);
    if (!res?.error) setIsSubmitted(true);
    else alert('Failed to create campaign: ' + res.error);
  };

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, 5));
  const previousStep = () => setCurrentStep((step) => Math.max(step - 1, 1));

  const stepTitle =
    currentStep === 1
      ? 'Create New Campaign'
      : currentStep === 2
        ? 'Define your goal & timeline'
        : currentStep === 3
          ? 'Beneficiary Details'
          : currentStep === 4
            ? 'Documents & Legal'
            : !isSubmitted ? 'Review Your Campaign' : '';

  const stepDescription =
    currentStep === 1
      ? 'Bring your vision to life and start making an impact today.'
      : currentStep === 2
        ? 'Set clear financial targets and milestones to build trust with your potential donors.'
        : currentStep === 3
          ? 'Please provide the details of the person or organization who will receive the funds collected from this campaign.'
          : currentStep === 4
            ? 'To ensure trust and transparency within the HOPECARD community, we require official documentation to verify your campaign\'s legitimacy.'
            : !isSubmitted ? 'Everything looks good? Publish your campaign to activate it as a draft. You can edit and activate it later from your campaigns dashboard.' : '';

  const nextLabel =
    currentStep === 1
      ? 'Next: Goal & Timeline'
      : currentStep === 2
        ? 'Next: Beneficiary Details'
        : currentStep === 3
          ? 'Next: Documents & Legal'
          : currentStep === 4
            ? 'Next: Final Review'
            : 'View My Campaigns';

  return (
    <AppShell userName={managerName} userRole="Campaign Manager" searchPlaceholder="Search campaigns...">
      <div className="w-full space-y-6 pb-10">
        {!isSubmitted ? (
          <>
            <div>
              <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">{stepTitle}</h1>
              <p className="mt-2 max-w-[860px] text-[15px] text-[#84716b]">{stepDescription}</p>
            </div>

            <section className="rounded-[28px] bg-white px-4 py-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:px-6">
              <div className="relative grid grid-cols-5 items-start">
                <div className="pointer-events-none absolute left-[4%] right-[4%] top-4 h-px bg-[#ece3df]" />
                {steps.map((step) => (
                  <div key={step.label} className="relative flex flex-col items-center">
                    <div
                      className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold ${
                        step.number === currentStep ? 'bg-[#b55247] text-white' : 'bg-[#efebe9] text-[#8e7f7a]'
                      }`}
                    >
                      {step.number}
                    </div>
                    <span
                      className={`mt-4 text-center text-[10px] font-extrabold uppercase tracking-[0.06em] ${
                        step.number === currentStep ? 'text-[#b55247]' : 'text-[#6f5f5b]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {currentStep === 1 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Campaign Basics</h2>

              <div className="mt-6 space-y-6">
                <InputBlock label="Campaign Name" placeholder="e.g. Clean Water Initiative for Mali Village" value={title} onChange={(e) => setTitle(e.target.value)} required />

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Category<span className="ml-0.5 text-[#b55247]">*</span></label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {categories.map(({ label, icon: Icon }) => {
                      const active = activeCategory === label;
                      return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setActiveCategory(label)}
                        className={`flex h-[82px] flex-col items-center justify-center rounded-[20px] border text-center transition-colors ${
                          active
                            ? 'border-[#c97a6d] bg-[#fff9f8] text-[#b55247]'
                            : 'border-transparent bg-[#f7f4f3] text-[#6e5f5b] hover:bg-[#f2ecea]'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="mt-2 text-[12px] font-bold">{label}</span>
                      </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Tell Your Story<span className="ml-0.5 text-[#b55247]">*</span></label>
                  <div className="mt-3 overflow-hidden rounded-[24px] bg-[#f7f4f3]">
                    <div className="flex items-center gap-4 px-4 py-3 text-[#786863]">
                      <button type="button">
                        <Type size={14} />
                      </button>
                      <button type="button">
                        <Undo2 size={14} />
                      </button>
                      <button type="button">
                        <List size={14} />
                      </button>
                      <button type="button">
                        <Link2 size={14} />
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      placeholder="Explain why you are starting this campaign and how the funds will be used..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[250px] w-full resize-none bg-[#f7f4f3] px-6 pb-6 pt-2 text-[14px] text-[#6d5d59] outline-none placeholder:text-[#b9aeaa]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Visual Impact</h2>
              <p className="mt-2 text-[13px] text-[#8d7d78]">High-quality visuals increase donations by up to 3x.</p>

              <DragDropUploader
                onFileSelect={(file) => setCoverImage(file)}
                className="mt-6 flex min-h-[280px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] px-6 text-center hover:bg-[#fff9f8]"
              >
                {coverImage ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 size={32} className="text-[#2ba05b] mb-4" />
                    <p className="text-[18px] font-bold text-[#4a3936]">{coverImage.name}</p>
                    <p className="mt-2 text-[12px] font-medium text-[#9a8d88]">Click to replace</p>
                  </div>
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e9e6] text-[#b55247]">
                      <Camera size={24} />
                    </div>
                    <p className="mt-5 text-[18px] font-bold text-[#4a3936]">Upload main cover photo</p>
                    <p className="mt-2 text-[12px] font-medium text-[#9a8d88]">Recommended size: 1200 x 675px</p>
                  </>
                )}
              </DragDropUploader>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DragDropUploader
                  className="flex h-[138px] items-center justify-center rounded-[24px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] text-[#6f5f5b] hover:bg-[#fff9f8]"
                >
                  <ImagePlus size={20} />
                </DragDropUploader>
                {[1, 2, 3].map((slot) => (
                  <DragDropUploader
                    key={slot}
                    className="flex h-[138px] items-center justify-center rounded-[24px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] text-[#6f5f5b] hover:bg-[#fff9f8]"
                  >
                    <Plus size={20} />
                  </DragDropUploader>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Financial Objectives</h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InputBlock label="Monetary Goal" placeholder="0.00" icon={BadgeDollarSign} iconColor="text-[#b79d45]" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
                <InputBlock label="Minimum Donation" placeholder="5.00" icon={HandCoins} type="number" value={minDonation} onChange={(e) => setMinDonation(e.target.value)} />
              </div>

              <div className="mt-5">
                <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Goal Deadline<span className="ml-0.5 text-[#b55247]">*</span></label>
                <div className="relative mt-3 flex h-[52px] items-center justify-between rounded-full bg-[#f7f4f3] px-5 group">
                  <div className="flex w-full items-center gap-3">
                    <CalendarDays size={16} className="relative z-10 pointer-events-none text-[#9a8d88]" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="relative z-20 w-full bg-transparent text-[14px] text-[#6d5d59] outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                  </div>
                  <CalendarDays size={16} className="absolute right-5 z-10 pointer-events-none text-[#9a8d88]" />
                </div>
                <p className="mt-2 text-[11px] text-[#a19490]">Campaigns typically run for 30-60 days for maximum impact.</p>
              </div>
            </section>

          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <HeartHandshake size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Select Beneficiaries<span className="ml-1 text-[#b55247]">*</span></h2>
              </div>
              <p className="mt-2 text-[13px] text-[#84716b]">Choose one approved beneficiary to invite to this campaign.</p>

              <div className="mt-6 space-y-4">
                {beneficiaries.length === 0 ? (
                  <p className="text-[14px] text-[#84716b] py-4">No approved beneficiaries found.</p>
                ) : (
                  beneficiaries.map((b) => {
                    const isSelected = selectedBeneficiaries.includes(b.id);
                    return (
                      <div key={b.id} className="flex items-center justify-between rounded-[22px] bg-[#f7f4f3] p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fce5c8] text-[#d98b2c] font-bold text-[14px]">
                            {b.first_name?.[0]}{b.last_name?.[0]}
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-[#382b28]">{b.first_name} {b.last_name}</h3>
                            <p className="text-[12px] text-[#8e7f7a]">{b.email} • {b.bank_name || 'No Bank'}</p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => toggleBeneficiary(b.id)}
                          className={`relative flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors ${
                            isSelected ? 'bg-[#2ba05b]' : 'bg-[#d1c5c1]'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              isSelected ? 'translate-x-[26px]' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        ) : null}

        {currentStep === 4 ? (
          <>
            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <FileBadge2 size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Legal &amp; Identity Documents</h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <DocumentUpload
                  label="Manager ID"
                  title="Drop your ID photo here"
                  subtitle="PNG, JPG or PDF (max. 10MB)"
                  icon={FileCheck2}
                  onFileSelect={(file) => setManagerId(file)}
                  selectedFile={managerId}
                  required
                />
                <DocumentUpload
                  label="Proof of Address"
                  title="Upload utility bill or bank statement"
                  subtitle="Dated within the last 6 months"
                  icon={MapPin}
                  onFileSelect={(file) => setProofOfAddress(file)}
                  selectedFile={proofOfAddress}
                  required
                />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-[20px] bg-[#fcf7ea] px-4 py-4 text-[#85734e]">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <p className="text-[12px] leading-6">
                  Your documents are encrypted and stored securely. They are only used for internal verification and are never shared publicly.
                </p>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8eae7] text-[#b55247]">
                  <ReceiptText size={16} />
                </div>
                <h2 className="text-[18px] font-extrabold text-[#382b28]">Agreements &amp; Terms<span className="ml-1 text-[#b55247]">*</span></h2>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { title: 'Terms of Service', copy: 'I agree to follow the campaign management rules and platform usage policies.', state: agreedToTerms, setState: setAgreedToTerms },
                  { title: 'Privacy Policy', copy: 'I understand how HOPECARD handles my personal and financial information.', state: agreedToPrivacy, setState: setAgreedToPrivacy },
                  { title: 'Campaign Accuracy', copy: 'I certify that all information provided in this campaign setup is true and accurate.', state: agreedToCampaignAccuracy, setState: setAgreedToCampaignAccuracy },
                ].map(({ title, copy, state, setState }) => (
                  <div key={title} className="flex items-start justify-between gap-4 rounded-[20px] bg-[#f7f4f3] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => setState(!state)} className={`mt-1 ${state ? 'text-[#2ba05b]' : 'text-[#d1c5c1]'}`}>
                        <CheckSquare size={16} />
                      </button>
                      <div>
                        <h3 className="text-[14px] font-bold text-[#433330]">{title}</h3>
                        <p className="mt-1 text-[12px] text-[#8d7d78]">{copy}</p>
                      </div>
                    </div>
                    <button type="button" className="text-[12px] font-bold text-[#c96a5b]">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-[20px] bg-white px-5 py-4 text-center text-[13px] text-[#8d7d78] shadow-[0_12px_32px_rgba(87,55,48,0.05)] ring-1 ring-[#f5ece8]">
              Need help with documents? <span className="font-semibold text-[#c96a5b]">Chat with Support</span> or visit our <span className="font-semibold text-[#c96a5b]">Help Center.</span>
            </div>
          </>
        ) : null}

        {currentStep === 5 ? (
          !isSubmitted ? (
            <>
              {validationErrors.length > 0 && (
                <div role="alert" aria-live="polite" className="rounded-[20px] bg-[#fef3f2] px-5 py-4 border border-[#f5d4d0] text-[#c96a5b] mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p id="error-summary-heading" className="font-bold text-[13px] mb-2">Cannot publish campaign yet. Please complete:</p>
                      <ul aria-labelledby="error-summary-heading" className="text-[12px] space-y-1">
                        {validationErrors.map((error, idx) => (
                          <li key={`${error.field}-${idx}`}>• {error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
                <div className="flex items-center justify-between border-b border-[#f5ece8] pb-6">
                  <h2 className="text-[18px] font-extrabold text-[#382b28]">Campaign Basics</h2>
                  <button type="button" onClick={() => setCurrentStep(1)} className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#c96a5b] transition-colors hover:text-[#b55247]">
                    <Pencil size={12} />
                    EDIT
                  </button>
                </div>
                <div className="pt-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Campaign Title</label>
                      <p className="mt-2 text-[15px] font-bold text-[#382b28]">{title || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Category</label>
                      <p className="mt-2 text-[14px] font-medium text-[#4a3936]">{activeCategory || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Story Summary</label>
                      <p className="mt-2 text-[13px] leading-relaxed text-[#6d5d59] line-clamp-3">{description || '—'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-extrabold text-[#382b28]">Goal &amp; Timeline</h2>
                  <button type="button" onClick={() => setCurrentStep(2)} className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#c96a5b] transition-colors hover:text-[#b55247]">
                    <Pencil size={12} />
                    EDIT
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div className="rounded-[20px] bg-[#f7f4f3] p-5">
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Target Amount</label>
                    <p className="mt-2 text-[22px] font-bold text-[#382b28]">
                      {targetAmount ? `₱${parseFloat(targetAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </p>
                    <p className="mt-1 text-[11px] text-[#9a8d88]">PHP - Philippine Peso</p>
                  </div>
                  <div className="rounded-[20px] bg-[#f7f4f3] p-5">
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">Deadline</label>
                    <p className="mt-2 text-[22px] font-bold text-[#382b28]">
                      {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </p>
                    <p className="mt-1 text-[11px] text-[#9a8d88]">
                      {endDate ? (() => {
                        const endDateTime = new Date(endDate + 'T00:00:00').getTime();
                        const daysRemaining = Math.max(0, Math.ceil((endDateTime - new Date().getTime()) / 86400000));
                        return `${new Date(endDate + 'T00:00:00').getFullYear()} (${daysRemaining} Days Remaining)`;
                      })() : '—'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-extrabold text-[#382b28]">Beneficiary &amp; Bank</h2>
                  <button type="button" onClick={() => setCurrentStep(3)} className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#c96a5b] transition-colors hover:text-[#b55247]">
                    <Pencil size={12} />
                    EDIT
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  {selectedBeneficiaries.length === 0 ? (
                    <p className="text-[14px] text-[#84716b] py-4">No beneficiaries selected.</p>
                  ) : (
                    beneficiaries
                      .filter(b => selectedBeneficiaries.includes(b.id))
                      .map(b => (
                        <div key={b.id} className="flex items-center justify-between rounded-[20px] bg-[#f7f4f3] p-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fce5c8] text-[#d98b2c] font-bold text-[12px]">
                              {b.first_name?.[0]}{b.last_name?.[0]}
                            </div>
                            <div>
                              <h3 className="text-[14px] font-bold text-[#382b28]">{b.first_name} {b.last_name}</h3>
                              <p className="text-[11px] text-[#8e7f7a]">{b.email || 'No email'}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#e8f5ec] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#2ba05b]">Approved</span>
                        </div>
                      ))
                  )}
                </div>
              </section>

              <section className="rounded-[30px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-extrabold text-[#382b28]">Document Verification</h2>
                  <button type="button" onClick={() => setCurrentStep(4)} className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#c96a5b] transition-colors hover:text-[#b55247]">
                    <Pencil size={12} />
                    EDIT
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-[20px] bg-[#f7f4f3] p-5">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-[#b55247]" />
                      <span className="text-[13px] font-bold text-[#382b28]">Manager ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {managerId ? (
                        <>
                          <Check size={14} className="text-[#2ba05b]" />
                          <span className="text-[11px] font-medium text-[#6d5d59]">{managerId.name}</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} className="text-[#c96a5b]" />
                          <span className="text-[11px] font-medium text-[#c96a5b]">No file uploaded</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-[20px] bg-[#f7f4f3] p-5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-[#b55247]" />
                      <span className="text-[13px] font-bold text-[#382b28]">Proof of Address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {proofOfAddress ? (
                        <>
                          <Check size={14} className="text-[#2ba05b]" />
                          <span className="text-[11px] font-medium text-[#6d5d59]">{proofOfAddress.name}</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} className="text-[#c96a5b]" />
                          <span className="text-[11px] font-medium text-[#c96a5b]">No file uploaded</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
              
              <div className="flex flex-col gap-4 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={previousStep}
                  className="text-left text-[12px] font-extrabold uppercase tracking-[0.06em] text-[#7e6d68] transition-colors hover:text-[#b55247]"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || validationErrors.length > 0}
                  className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-8 text-[13px] font-extrabold uppercase tracking-[0.05em] text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] transition-all hover:bg-[#a0483e] disabled:opacity-75"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Campaign'}
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="rounded-[20px] bg-white px-5 py-4 text-center text-[13px] text-[#8d7d78] shadow-[0_12px_32px_rgba(87,55,48,0.05)] ring-1 ring-[#f5ece8]">
                Need help with your final submission? <span className="font-semibold text-[#c96a5b]">Chat with Support</span> or visit our <span className="font-semibold text-[#c96a5b]">Help Center.</span>
              </div>
            </>
          ) : (
          <>
            <section className="rounded-[30px] bg-white px-6 py-10 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8] sm:px-10">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#3caa71] text-white shadow-[0_16px_32px_rgba(60,170,113,0.28)]">
                  <Check size={28} strokeWidth={3} />
                </div>
                <h2 className="mt-6 text-[26px] font-extrabold tracking-[-0.02em] text-[#2e2523]">
                  Congratulations, {(managerName ?? '').split(' ')[0]}! 🎉
                </h2>
                <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-7 text-[#7f6f6a]">
                  Your campaign <span className="font-bold text-[#b55247]">&quot;{title}&quot;</span> has been successfully created and is saved as a <span className="font-bold text-[#e38f4d]">Draft</span>. It&apos;s ready for you to activate whenever you are.
                </p>
              </div>

              {/* Campaign Summary */}
              <div className="mx-auto mt-8 max-w-[700px] rounded-[20px] bg-[#faf7f5] px-6 py-5 ring-1 ring-[#f0e6e2]">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-[#9a8984]">Campaign Summary</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#b0a09b]">Campaign Name</p>
                    <p className="mt-0.5 text-[14px] font-bold text-[#3b2f2c]">{title}</p>
                  </div>
                  {activeCategory && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#b0a09b]">Category</p>
                      <p className="mt-0.5 text-[14px] font-bold text-[#3b2f2c] capitalize">{activeCategory}</p>
                    </div>
                  )}
                  {targetAmount && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#b0a09b]">Target Amount</p>
                      <p className="mt-0.5 text-[14px] font-bold text-[#3b2f2c]">
                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(parseFloat(targetAmount))}
                      </p>
                    </div>
                  )}
                  {endDate && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#b0a09b]">End Date</p>
                      <p className="mt-0.5 text-[14px] font-bold text-[#3b2f2c]">
                        {new Date(endDate + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                  {selectedBeneficiaries.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#b0a09b]">Invited Beneficiaries</p>
                      <p className="mt-0.5 text-[14px] font-bold text-[#3b2f2c]">
                        {beneficiaries
                          .filter((b) => selectedBeneficiaries.includes(b.id))
                          .map((b) => `${b.first_name} ${b.last_name}`)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#b0a09b]">Status</p>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#fff4e5] px-3 py-1 text-[11px] font-extrabold text-[#e38f4d]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e38f4d]" />
                      Draft — Pending Activation
                    </span>
                  </div>
                </div>
              </div>

              {/* Next step callout */}
              <div className="mx-auto mt-6 max-w-[700px] rounded-[18px] border border-[#e38f4d]/30 bg-[#fff9f0] px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e38f4d] text-white">
                    <ArrowRight size={14} />
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#7a4f1e]">Action Required: Activate Your Campaign</p>
                    <p className="mt-1 text-[12px] leading-6 text-[#9a6e45]">
                      Your campaign is saved as a <strong>Draft</strong> and is not yet visible to donors. Head to <strong>My Campaigns</strong> and click the <strong>Activate</strong> button to make it live on the marketplace.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/campaign-manager/my-campaigns"
                  className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-8 text-[13px] font-extrabold uppercase tracking-[0.04em] text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] hover:bg-[#a0483e] transition-colors"
                >
                  Go to My Campaigns
                  <ArrowRight size={14} />
                </Link>
                <Link href="/campaign-manager/dashboard" className="text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6f6a] hover:text-[#4a3936] transition-colors">
                  Back to Dashboard
                </Link>
              </div>
            </section>
          </>
          )
        ) : null}

        {currentStep !== 5 ? (
        <div className="flex flex-col gap-4 pb-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 1}
            className={`text-left text-[12px] font-extrabold uppercase tracking-[0.06em] ${
              currentStep === 1 ? 'text-[#c8bbb7]' : 'text-[#7e6d68]'
            }`}
          >
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-8 text-[13px] font-extrabold uppercase tracking-[0.05em] text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
          >
            {nextLabel}
            <ArrowRight size={15} />
          </button>
        </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function InputBlock({
  label,
  placeholder,
  icon: Icon,
  iconColor = 'text-[#9a8d88]',
  type = 'text',
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  icon?: typeof FileText;
  iconColor?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">
        {label}{required && <span className="ml-0.5 text-[#b55247]">*</span>}
      </label>
      <div className="mt-3 flex h-[52px] items-center gap-3 rounded-full bg-[#f7f4f3] px-5">
        {Icon ? <Icon size={16} className={iconColor} /> : null}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-transparent text-[14px] text-[#6d5d59] outline-none placeholder:text-[#b9aeaa] ${
            type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''
          }`}
        />
      </div>
    </div>
  );
}

function DocumentUpload({
  label,
  title,
  subtitle,
  icon: Icon,
  onFileSelect,
  selectedFile,
  required,
}: {
  label: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#8e7f7a]">
        {label}{required && <span className="ml-0.5 text-[#b55247]">*</span>}
      </label>
      <DragDropUploader
        onFileSelect={onFileSelect}
        className="mt-3 flex min-h-[220px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-[#e9c9c3] bg-[#fdfbfa] px-6 text-center hover:bg-[#fff9f8]"
      >
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <Check size={24} className="text-[#2ba05b] mb-3" />
            <p className="text-[14px] font-bold text-[#4a3936]">{selectedFile.name}</p>
            <p className="mt-2 text-[11px] font-medium text-[#9a8d88]">Click to replace</p>
          </div>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#b5a7a2] shadow-[0_8px_18px_rgba(87,55,48,0.04)]">
              <Icon size={20} />
            </div>
            <p className="mt-5 text-[16px] font-bold text-[#4a3936]">{title}</p>
            <p className="mt-2 text-[11px] font-medium text-[#9a8d88]">{subtitle}</p>
            <span className="mt-4 rounded-full bg-[#f8eae7] px-4 py-2 text-[11px] font-bold text-[#c96a5b]">Select File</span>
          </>
        )}
      </DragDropUploader>
    </div>
  );
}

function DragDropUploader({ className, children, onFileSelect }: { className?: string; children: React.ReactNode; onFileSelect?: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect?.(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${className} cursor-pointer transition-all ${
        isDragging ? 'border-[#c97a6d] bg-[#fff9f8] ring-1 ring-[#c97a6d]' : ''
      }`}
    >
      <input type="file" className="hidden" ref={inputRef} onChange={(e) => {
        if (e.target.files && e.target.files.length > 0) {
          onFileSelect?.(e.target.files[0]);
        }
      }} />
      {children}
    </div>
  );
}
