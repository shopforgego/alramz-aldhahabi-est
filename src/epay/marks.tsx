import React from "react";

export function PaymentMarks() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-[11px] font-black text-[#259BD6]">mada</span>
      <span className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-[11px] font-black tracking-widest text-[#1A1F71]">VISA</span>
      <span className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-[11px] font-black text-[#EB001B]">mastercard</span>
      <span className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-black px-3 text-[11px] font-bold text-white">Apple Pay</span>
    </div>
  );
}
