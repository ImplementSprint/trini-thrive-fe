'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState, ChangeEvent } from 'react';
import {
  ArrowRight,
  Building2,
  Lock,
  Mail,
  UserRound,
  Phone,
  Upload,
  CheckCircle2,
  ShieldCheck,
  FileText,
  BadgeCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import AuthShell from '@/campaign-manager-components/AuthShell';
import { signUpAction } from '../actions/auth';

export default function CreateAccountPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    organization: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [files, setFiles] = useState<{
    secRegistration: File | null;
    orgCertificate: File | null;
  }>({ secRegistration: null, orgCertificate: null });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stale cookie check: clear any non-campaign-manager persona on mount
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const persona = cookies.find(c => c.startsWith('persona='))?.split('=')[1];
    if (persona && persona !== 'campaign-manager') {
      document.cookie = 'persona=; path=/; SameSite=Strict; Max-Age=0';
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: 'secRegistration' | 'orgCertificate',
  ) => {
    if (e.target.files?.[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
      if (error) setError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('firstName', formData.firstName);
    fd.append('lastName', formData.lastName);
    fd.append('organization', formData.organization);
    fd.append('email', formData.email);
    fd.append('contactNumber', formData.contactNumber);
    fd.append('password', formData.password);
    fd.append('confirmPassword', formData.confirmPassword);
    if (files.secRegistration) fd.append('secRegistration', files.secRegistration);
    if (files.orgCertificate) fd.append('orgCertificate', files.orgCertificate);

    const result = await signUpAction(fd);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      setFiles({ secRegistration: null, orgCertificate: null });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check Your Email"
        description="We've sent a confirmation link to your email address."
        footerRightLabel="Draft"
      >
        <p className="text-center text-[13px] font-medium text-[#8f817d]">
          Click the link in your email to confirm your account. Once confirmed,
          an admin will review and approve your access.
        </p>
        <p className="mt-6 text-center text-[11px] text-[#8f817d]">
          Already confirmed?{' '}
          <Link href="/campaign-manager/create-account" className="font-semibold text-[#f0a4a0]">
            Sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Organization Registration"
      description="Provide your organization details to join our formal registry and start your mission."
      footerRightLabel="Verified"
      maxWidth="max-w-[640px]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">First Name</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <UserRound size={16} className="text-[#bcb3b0]" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Last Name</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <UserRound size={16} className="text-[#bcb3b0]" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Dela Cruz"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Organization</span>
          <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
            <Building2 size={16} className="text-[#bcb3b0]" />
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="HopeCard Foundation"
              className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
              required
            />
          </div>
        </label>

        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Email Address</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <Mail size={16} className="text-[#bcb3b0]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Contact Number</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <Phone size={16} className="text-[#bcb3b0]" />
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="09123456789"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
            </div>
          </label>
        </div>

        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Password</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <Lock size={16} className="text-[#bcb3b0]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition">
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">Confirm Password</span>
            <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f2f1] px-5">
              <ShieldCheck size={16} className="text-[#bcb3b0]" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent text-[13px] font-medium text-[#6d4a44] outline-none placeholder:text-[#bdb1ae]"
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-[#bcb3b0] hover:text-[#8f7f7b] transition">
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2 pb-1">
          <span className="text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763] whitespace-nowrap">
            Required Documents
          </span>
          <div className="h-px w-full bg-[#f4ecea]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6c9c5] bg-[#fdfaf9] p-6 text-center transition hover:bg-[#f2eaea]">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'secRegistration')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            {files.secRegistration ? (
              <>
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#fff] text-[#a6493f] shadow-sm">
                  <CheckCircle2 size={16} />
                </div>
                <span className="mt-3 line-clamp-1 text-[12px] font-extrabold text-[#6d4a44]">{files.secRegistration.name}</span>
                <span className="mt-1 text-[11px] font-medium text-[#9a8d88]">Click to change</span>
              </>
            ) : (
              <>
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#fcdbd6] text-[#e06d61]">
                  <FileText size={16} />
                </div>
                <span className="mt-3 text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">
                  SEC Registration
                </span>
                <span className="mt-2 text-[13px] font-bold text-[#433330]">Click to upload</span>
                <span className="mt-1 text-[11px] font-medium text-[#9a8d88]">PDF, JPG up to 5MB</span>
              </>
            )}
          </label>

          <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e6c9c5] bg-[#fdfaf9] p-6 text-center transition hover:bg-[#f2eaea]">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'orgCertificate')}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            {files.orgCertificate ? (
              <>
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#fff] text-[#a6493f] shadow-sm">
                  <CheckCircle2 size={16} />
                </div>
                <span className="mt-3 line-clamp-1 text-[12px] font-extrabold text-[#6d4a44]">{files.orgCertificate.name}</span>
                <span className="mt-1 text-[11px] font-medium text-[#9a8d88]">Click to change</span>
              </>
            ) : (
              <>
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#fcdbd6] text-[#e06d61]">
                  <BadgeCheck size={16} />
                </div>
                <span className="mt-3 text-[12px] font-extrabold uppercase tracking-[0.05em] text-[#7f6763]">
                  Organizational Cert.
                </span>
                <span className="mt-2 text-[13px] font-bold text-[#433330]">Click to upload</span>
                <span className="mt-1 text-[11px] font-medium text-[#9a8d88]">PDF, JPG up to 5MB</span>
              </>
            )}
          </label>
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 flex h-4 w-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-[4px] border border-[#d6c5c2] bg-white transition checked:border-[#a6493f] checked:bg-[#a6493f] hover:border-[#b5a8a6]"
            required
          />
          <span className="text-[13px] leading-6 text-[#887a78]">
            I certify that the information and documents provided are accurate and valid. I agree to the{' '}
            <Link href="#" className="font-semibold text-[#a6493f] hover:underline">
              Terms of Service
            </Link>.
          </span>
        </label>

        {error && (
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#823a33] text-[13px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(130,58,51,0.22)] transition hover:bg-[#6e2f2a] disabled:opacity-60"
        >
          {loading ? 'CREATING ACCOUNT...' : 'COMPLETE REGISTRATION'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-[#8f817d]">
        Already have an account?{' '}
        <Link href="/campaign-manager/create-account" className="font-semibold text-[#f07b71]">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
