import React, { useEffect, useRef } from "react";

export const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || "70fa0926-a8de-4128-a366-7ab806446be4";

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
    __hcaptchaLoading?: Promise<void>;
  }
}

function loadScript() {
  if (window.hcaptcha) return Promise.resolve();
  if (window.__hcaptchaLoading) return window.__hcaptchaLoading;
  window.__hcaptchaLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="js.hcaptcha.com/1/api.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      if (window.hcaptcha) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("hcaptcha"));
    document.head.appendChild(script);
  });
  return window.__hcaptchaLoading;
}

export function HcaptchaModal({
  open,
  lang,
  resetSignal,
  onToken,
  onCancel,
}: {
  open: boolean;
  lang: "ar" | "en";
  resetSignal: number;
  onToken: (token: string | null) => void;
  onCancel: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !host.current || !window.hcaptcha) return;
        if (widget.current) {
          window.hcaptcha.remove(widget.current);
          widget.current = null;
        }
        widget.current = window.hcaptcha.render(host.current, {
          sitekey: HCAPTCHA_SITE_KEY,
          hl: lang === "ar" ? "ar" : "en",
          callback: (token: string) => onToken(token),
          "error-callback": () => onToken(null),
          "expired-callback": () => onToken(null),
        });
      })
      .catch(() => onToken(null));
    return () => {
      cancelled = true;
    };
  }, [open, lang, resetSignal, onToken]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-black/55 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl bg-[#fbfbf8] border border-amber-200 shadow-2xl p-5">
        <p className="text-sm font-bold text-[#064e3b] mb-4 text-center">
          {lang === "ar" ? "خطوة أخيرة قبل إتمام الدفع. أكمل التحقق أدناه." : "One more step before continuing. Complete the check below."}
        </p>
        <div className="flex justify-center min-h-[78px]" ref={host} />
        <button type="button" onClick={onCancel} className="mt-4 w-full rounded-xl border border-stone-300 py-2.5 text-sm font-bold text-stone-700">
          {lang === "ar" ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
