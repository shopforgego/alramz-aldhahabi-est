import React, { useEffect, useRef } from "react";

export const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || "70fa0926-a8de-4128-a366-7ab806446be4";

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
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
    <div className="fixed inset-0 z-[1000] bg-black/45 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl px-5 pt-6 pb-5 w-full max-w-[360px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] flex flex-col items-center gap-4 text-center">
        <p className="m-0 text-[15px] font-medium text-[#1a1a1a] leading-snug">
          {lang === "ar"
            ? "خطوة أخيرة قبل إتمام الدفع. أكمل التحقق أدناه."
            : "One more step before finishing. Complete the check below."}
        </p>
        <div ref={host} className="flex justify-center w-full min-h-[78px]" />
        <button type="button" onClick={onCancel} className="bg-transparent border-0 text-[#4a4a4a] text-sm font-medium px-3 py-2">
          {lang === "ar" ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
