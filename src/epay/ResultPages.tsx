import React, { useEffect, useState, useRef, useCallback } from "react";
import { Check, ChevronDown, Copy, CreditCard, FileText, Globe, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { storeConfig } from "../config/store";
import { HcaptchaModal } from "./hcaptcha";

export function SuccessPage() {
  const q = new URLSearchParams(window.location.search);
  const initialLang = q.get("lang")?.toLowerCase() === "en" ? "en" : q.get("lang")?.toLowerCase() === "ar" ? "ar" : "ar";
  const [lang, setLang] = useState<"ar" | "en">(initialLang);
  const isRtl = lang === "ar";
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dateTimeStr, setDateTimeStr] = useState("");
  const [data, setData] = useState({
    orderId: q.get("orderId") || q.get("order") || "",
    amount: q.get("amount") || "",
    customerName: q.get("name") || "",
    customerEmail: q.get("email") || "",
    customerPhone: q.get("phone") || "",
    receipt: q.get("receipt") || "",
    status: q.get("status") || "SUCCESS",
  });

  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    const now = new Date();
    setDateTimeStr(
      `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} - ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`,
    );

    const nameParam = q.get("name") || "";
    const emailParam = q.get("email") || "";
    const phoneParam = q.get("phone") || "";
    const orderIdParam = q.get("orderId") || q.get("order") || "";
    let resolvedName = nameParam;
    let resolvedEmail = emailParam;
    let resolvedPhone = phoneParam;
    let currentOrderId = orderIdParam;
    let amount = q.get("amount") || "";
    let receipt = q.get("receipt") || "";

    try {
      const stored = sessionStorage.getItem("alramz_payment_session");
      const parsed = stored ? JSON.parse(stored) : null;
      resolvedName = resolvedName || parsed?.customerName || "";
      resolvedEmail = resolvedEmail || parsed?.email || "";
      resolvedPhone = resolvedPhone || parsed?.phone || "";
      currentOrderId = currentOrderId || parsed?.orderId || "";
      amount = amount || parsed?.amount || "";
      receipt = receipt || parsed?.receipt || "";
    } catch {
      /* ignore */
    }

    setData({
      orderId: currentOrderId,
      amount,
      customerName: resolvedName,
      customerEmail: resolvedEmail,
      customerPhone: resolvedPhone,
      receipt,
      status: q.get("status") || "SUCCESS",
    });

    if ((!resolvedName || !resolvedEmail || !resolvedPhone) && currentOrderId.startsWith("BS-")) {
      fetch(`/api/links?short=${encodeURIComponent(currentOrderId)}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.link) {
            const l = resData.link;
            setData((p) => ({
              ...p,
              customerName: resolvedName || l.customerName || p.customerName,
              customerEmail: resolvedEmail || l.customerEmail || p.customerEmail,
              customerPhone: resolvedPhone || l.customerPhone || p.customerPhone,
              amount: p.amount || String(l.total || ""),
            }));
          }
        })
        .catch(() => undefined);
    }
  }, [lang, isRtl]);

  const handleCopyRef = () => {
    if (!data.orderId || !navigator?.clipboard) return;
    navigator.clipboard.writeText(data.orderId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    setPaymentOpen(true);
    setOrderOpen(true);
    window.setTimeout(() => window.print(), 150);
  };

  const formattedAmount = Number(data.amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const merchant = isRtl ? "مؤسسة الرمز الذهبي الراقي" : "Al Ramz Al Dhahabi";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#fcfdfd] text-[#1e293b] flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-x-hidden selection:bg-emerald-500 selection:text-white print:bg-white print:p-0"
      style={{
        fontFamily: isRtl
          ? "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans Arabic\", Tahoma, Arial, sans-serif"
          : "-apple-system, BlinkMacSystemFont, \"San Francisco\", \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif",
      }}
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none translate-x-20 -translate-y-20" />
      <div className="w-full max-w-[430px] sm:max-w-[460px] mx-auto flex-1 flex flex-col justify-between">
        <header className="flex items-center justify-between pb-6 pt-2">
          <img src="/logo.png" alt={storeConfig.companyNameEn} className="h-8 sm:h-9 w-auto object-contain" />
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">{merchant}</span>
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-600 flex items-center gap-1 transition-all shadow-xs cursor-pointer print:hidden"
            >
              <Globe className="w-3 h-3 text-slate-500" />
              <span>{lang === "ar" ? "EN" : "عربي"}</span>
            </button>
          </div>
        </header>

        <div className="text-center my-6 sm:my-8 space-y-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#e8f7ee] border-[3px] border-[#22c55e] flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-12 h-12 sm:w-14 sm:h-14 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#2e7d32] tracking-tight">{isRtl ? "!شكرًا لك" : "Thank you!"}</h1>
          <p className="text-sm sm:text-[15px] text-slate-700 font-normal">
            {isRtl ? "!تهانينا، تم إتمام عملية الدفع بنجاح" : "Congratulations, payment was completed successfully!"}
          </p>
          <p className="text-sm sm:text-[15px] text-slate-700">
            {isRtl ? (
              <>
                <span>تم دفع مبلغ </span>
                <strong className="text-[#2e7d32] font-bold">{formattedAmount} ريال سعودي</strong>
                <span>.</span>
              </>
            ) : (
              <>
                <span>An amount of </span>
                <strong className="text-[#2e7d32] font-bold">{formattedAmount} SAR</strong>
                <span> has been paid.</span>
              </>
            )}
          </p>
        </div>

        <div className="space-y-3.5 my-2">
          <div className="border border-slate-200/90 rounded-2xl bg-white shadow-xs overflow-hidden">
            <button type="button" onClick={() => setPaymentOpen(!paymentOpen)} className="w-full p-4 flex items-center justify-between text-start cursor-pointer hover:bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <CreditCard className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-[14.5px] sm:text-[15px] font-semibold text-slate-900">{isRtl ? "تفاصيل الدفع" : "Payment details"}</span>
                  <span className="text-xs font-medium text-emerald-600">{isRtl ? "نجاح" : "Success"}</span>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-700 transition-transform duration-200 shrink-0 ${paymentOpen ? "rotate-180" : ""}`} />
            </button>
            {paymentOpen && (
              <div className="border-t border-slate-100 p-4 space-y-3 bg-[#fafbfc]/70 text-xs sm:text-[13px]">
                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{isRtl ? "رقم المرجع" : "Reference No"}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{data.orderId || "—"}</span>
                    <button type="button" onClick={handleCopyRef} className="p-1 text-slate-400 hover:text-slate-700 print:hidden" title={isRtl ? "نسخ رقم المرجع" : "Copy Reference"}>
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{isRtl ? "الحالة" : "Status"}</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{isRtl ? "ناجح" : "Success"}</span>
                  </span>
                </div>
                {data.receipt && (
                  <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">{isRtl ? "رقم الإيصال" : "Receipt"}</span>
                    <span className="font-mono font-bold text-slate-900">{data.receipt}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 py-1">
                  <span className="text-slate-500 font-medium">{isRtl ? "بوابة الدفع" : "Gateway"}</span>
                  <span className="font-semibold text-slate-900 text-end">{isRtl ? "البنك الأهلي السعودي (AlAhli SNB) - MPGS" : "Saudi National Bank (SNB) - MPGS"}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border border-slate-200/90 rounded-2xl bg-white shadow-xs overflow-hidden">
            <button type="button" onClick={() => setOrderOpen(!orderOpen)} className="w-full p-4 flex items-center justify-between text-start cursor-pointer hover:bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <FileText className="w-5 h-5 stroke-[1.5]" />
                </div>
                <span className="text-[14.5px] sm:text-[15px] font-semibold text-slate-900">{isRtl ? "وصف الطلب" : "Order description"}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-700 transition-transform duration-200 shrink-0 ${orderOpen ? "rotate-180" : ""}`} />
            </button>
            {orderOpen && (
              <div className="border-t border-slate-100 p-4 space-y-3 bg-[#fafbfc]/70 text-xs sm:text-[13px]">
                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{isRtl ? "اسم العميل" : "Customer name"}</span>
                  <span className="font-semibold text-slate-900 text-end">{data.customerName || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{isRtl ? "البريد الإلكتروني للعميل" : "Customer email"}</span>
                  <span className="font-mono text-slate-900 text-end text-xs" dir="ltr">{data.customerEmail || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{isRtl ? "هاتف العميل" : "Customer phone"}</span>
                  <span className="font-mono text-slate-900 text-end text-xs" dir="ltr">{data.customerPhone || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{isRtl ? "معرف داخلي" : "Internal ID"}</span>
                  <span className="font-mono font-bold text-slate-900">{data.orderId || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1">
                  <span className="text-slate-500 font-medium">{isRtl ? "التاريخ و الوقت" : "Date & Time"}</span>
                  <span className="font-mono text-slate-800 text-xs text-end" dir="ltr">{dateTimeStr}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6">
          <button type="button" onClick={handlePrint} className="w-full h-[50px] sm:h-[52px] bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
            <FileText className="w-5 h-5 stroke-[2]" />
            <span>{isRtl ? "تنزيل الإيصال" : "Download Receipt"}</span>
          </button>
        </div>

        <div className="w-full bg-[#181820] text-white py-3.5 px-6 rounded-2xl flex items-center justify-center gap-4 mt-6 print:hidden">
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center hover:bg-white/10" title="X">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center hover:bg-white/10" title="Instagram">
            <svg className="w-4 h-4 stroke-white fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export function InvoicePage() {
  const short = new URLSearchParams(window.location.search).get("short") || "";
  const [link, setLink] = useState<any>(null);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  /* ── PIN gate ── */
  const [pinRequired, setPinRequired] = useState<boolean | null>(null);
  const [pinVerified, setPinVerified] = useState(() => {
    try {
      return sessionStorage.getItem("alramz_portal_pin_verified") === "true";
    } catch {
      return false;
    }
  });
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    fetch(`/api/settings?t=${Date.now()}`, { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        clearTimeout(timer);
        if (data?.settings?.enableOpenPaymentPortal === false || data?.settings?.paymentsEnabled === false) {
          setDisabled(true);
          setPinRequired(false);
          return;
        }
        if (data?.settings) {
          setPinRequired(data.settings.portalPinRequired === true);
        } else {
          setPinRequired(false);
        }
      })
      .catch(() => {
        clearTimeout(timer);
        setPinRequired(false);
      });

    return () => clearTimeout(timer);
  }, []);

  const handlePinChange = useCallback((index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    setPinError("");
    setPinDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  }, []);

  const handlePinKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  }, [pinDigits]);

  const handlePinPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setPinDigits(pasted.split(""));
      pinRefs.current[3]?.focus();
    }
  }, []);

  const submitPin = useCallback(async () => {
    const code = pinDigits.join("");
    if (code.length !== 4) {
      setPinError("يرجى إدخال الرمز المكون من 4 أرقام");
      return;
    }
    setPinLoading(true);
    setPinError("");
    try {
      const res = await fetch("/api/portal/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: code, type: "portal" }),
      });
      const data = await res.json();
      if (data.success) {
        setPinVerified(true);
        try {
          sessionStorage.setItem("alramz_portal_pin_verified", "true");
        } catch {}
      } else {
        setPinError(data.error || "رمز PIN غير صحيح");
        setPinDigits(["", "", "", ""]);
        pinRefs.current[0]?.focus();
      }
    } catch {
      setPinError("حدث خطأ في الاتصال");
    } finally {
      setPinLoading(false);
    }
  }, [pinDigits]);

  useEffect(() => {
    if (!short) {
      setMissing(true);
      return;
    }
    fetch(`/api/links?short=${encodeURIComponent(short)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setError(data.error || "الفاتورة غير موجودة");
          return;
        }
        setLink(data.link);
        setForm({
          name: data.link.customerName || "",
          email: data.link.customerEmail || "",
          phone: data.link.customerPhone || "",
        });
      })
      .catch(() => setError("تعذر تحميل الفاتورة"));
  }, [short]);

  const start = async (hcaptchaToken: string | null) => {
    const res = await fetch("/api/checkout/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shortCode: short,
        name: form.name,
        email: form.email,
        phone: form.phone,
        lang: "ar",
        hcaptchaToken,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.checkoutUrl) {
      setLoading(false);
      setCaptcha(false);
      setError(data.error || "تعذر بدء الدفع");
      return;
    }
    window.location.href = data.checkoutUrl;
  };

  if (missing || disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 p-4">
        <div className="flex items-center gap-4 divide-x divide-slate-300">
          <h1 className="text-2xl font-bold px-4">404</h1>
          <p className="px-4 text-sm text-slate-600">This page could not be found.</p>
        </div>
      </div>
    );
  }

  if (pinRequired === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#0053a4" }} />
      </div>
    );
  }

  if (pinRequired && !pinVerified) {
    return (
      <div className="pin-gate-overlay">
        <div className="pin-gate-card">
          <div className="pin-gate-icon">
            <Lock className="h-10 w-10" style={{ color: "#0053a4" }} />
          </div>
          <h2 className="pin-gate-title">رمز الدخول</h2>
          <p className="pin-gate-subtitle">
            أدخل رمز PIN المكون من 4 أرقام للوصول إلى تفاصيل الفاتورة
          </p>
          <div className="pin-gate-inputs" dir="ltr">
            {pinDigits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { pinRefs.current[i] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                className={`pin-gate-digit${pinError ? " pin-gate-digit--error" : ""}`}
                value={digit}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                onPaste={i === 0 ? handlePinPaste : undefined}
                autoFocus={i === 0}
                aria-label={`PIN digit ${i + 1}`}
                disabled={pinLoading}
              />
            ))}
          </div>
          {pinError && (
            <p className="pin-gate-error">{pinError}</p>
          )}
          <button
            type="button"
            className="pin-gate-submit"
            onClick={submitPin}
            disabled={pinLoading || pinDigits.join("").length !== 4}
          >
            {pinLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                <span>تحقق</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8" dir="rtl">
      <HcaptchaModal open={captcha} lang="ar" resetSignal={0} onCancel={() => { setCaptcha(false); setLoading(false); }} onToken={(token) => token ? start(token) : setCaptcha(false)} />
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
        <img src="/logo.png" alt="" className="h-14 w-14 rounded-xl object-contain" />
        <h1 className="mt-3 text-xl font-black text-slate-900">{storeConfig.companyNameAr}</h1>
        <p className="text-xs text-stone-500">فاتورة {short}</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {link && (
          <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); setLoading(true); setCaptcha(true); }}>
            <p className="text-3xl font-black" dir="ltr">{Number(link.total).toLocaleString("en-US", { minimumFractionDigits: 2 })} ر.س</p>
            <p className="text-sm text-stone-600">{link.title}</p>
            {link.status !== "ACTIVE" && <p className="text-sm font-bold text-amber-700">حالة الفاتورة: {link.status}</p>}
            <input required className="w-full rounded-xl border px-3 py-3 text-sm" placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" className="w-full rounded-xl border px-3 py-3 text-sm" placeholder="البريد" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required className="w-full rounded-xl border px-3 py-3 text-sm" placeholder="الجوال" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <button disabled={loading || link.status !== "ACTIVE"} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-black text-white disabled:opacity-50">المتابعة للدفع</button>
          </form>
        )}
      </div>
    </div>
  );
}
