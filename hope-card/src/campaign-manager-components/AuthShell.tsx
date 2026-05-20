import Image from 'next/image';
import { ReactNode } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footerRightLabel?: string;
  maxWidth?: string;
}

export default function AuthShell({
  title,
  description,
  children,
  footerRightLabel = 'Verified',
  maxWidth = 'max-w-[500px]',
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fcfaf9] px-4 py-10">
      <div className={`flex w-full flex-col items-center ${maxWidth}`}>
        <section className="w-full rounded-[24px] bg-white px-10 pb-10 pt-8 shadow-[0_24px_65px_rgba(74,43,37,0.08)]">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Image src="/campaign-manager/images/logo_h.png" alt="HOPECARD" width={40} height={40} className="h-[40px] w-[40px] object-contain" />
            <span className="text-[24px] font-extrabold tracking-[-0.02em] text-[#b25045]">HOPECARD</span>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-[20px] font-extrabold text-[#6d4a44]">{title}</h1>
            <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-[1.6] text-[#9d8f8b]">{description}</p>
          </div>

          {children}
        </section>

        <div className="mt-8 flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c5bcb9]">
          <div className="flex items-center gap-2">
            <Lock size={14} strokeWidth={2.4} />
            <span>Secure SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} strokeWidth={2.4} />
            <span>{footerRightLabel}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
