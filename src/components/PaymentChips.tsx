import React from 'react';

const chipClass =
  "inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#1f2a44] shadow-sm border border-slate-200/80";

const iconClass = "w-5 h-5 shrink-0";

export function PaymentChips() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 text-center lg:px-6">
      <p className="text-[11px] tracking-[0.15em] text-slate-400 font-bold mb-3">
        وسائل الدفع المعتمدة
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className={chipClass}>
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="#1a1f71" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M3 10h18" />
          </svg>
          Visa
        </span>

        <span className={chipClass}>
          <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="12" r="6" fill="#eb001b" />
            <circle cx="15" cy="12" r="6" fill="#f79e1b" />
          </svg>
          Mastercard
        </span>

        <span className={chipClass}>
          <svg className={iconClass} viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="6" width="20" height="12" rx="2" fill="#00a651" />
            <text
              x="12"
              y="14.5"
              textAnchor="middle"
              fontSize="7"
              fontWeight="800"
              fontFamily="Arial, sans-serif"
              fill="#ffffff"
            >
              mada
            </text>
          </svg>
          Mada
        </span>

        <span className={chipClass}>
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 12h10" />
          </svg>
          التحويل البنكي
        </span>
      </div>
    </div>
  );
}
