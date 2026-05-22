import { ReactNode } from 'react';

interface SectionPlaceholderProps {
  title: string;
  description: string;
  actionLabel?: string;
  aside?: ReactNode;
}

export default function SectionPlaceholder({
  title,
  description,
  actionLabel,
  aside,
}: SectionPlaceholderProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[30px] bg-white p-7 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
        <div className="flex flex-col gap-5 border-b border-[#f4ebea] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">{title}</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#84716b]">{description}</p>
          </div>

          {actionLabel ? (
            <button
              type="button"
              className="rounded-full bg-[#b55247] px-6 py-3 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Ready for design', 'This page is wired into navigation and ready for your final screenshot-based pass.'],
            ['Frontend only', 'The content here is static for now so backend can connect data later.'],
            ['Consistent shell', 'Sidebar navigation, search header, and logout behavior are already shared.'],
          ].map(([cardTitle, cardText]) => (
            <article key={cardTitle} className="rounded-[22px] bg-[#fcfaf8] p-5 ring-1 ring-[#f3ebe7]">
              <h2 className="text-[15px] font-extrabold text-[#433330]">{cardTitle}</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#8c7c77]">{cardText}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        {aside ?? (
          <>
            <section className="rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[16px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Next Step</h2>
              <p className="mt-4 text-[14px] leading-6 text-[#87736e]">
                Send the screenshot for this tab when ready and I can replace this placeholder with the exact design.
              </p>
            </section>

            <section className="rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[16px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Status</h2>
              <div className="mt-4 space-y-3">
                {['Page route created', 'Sidebar navigation linked', 'Logout modal enabled'].map((item) => (
                  <div key={item} className="rounded-2xl bg-[#faf7f5] px-4 py-3 text-[13px] font-semibold text-[#6d5d59]">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </aside>
    </div>
  );
}
