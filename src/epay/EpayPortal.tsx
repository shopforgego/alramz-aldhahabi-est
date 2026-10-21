import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { storeConfig } from "../config/store";
import { HcaptchaModal } from "./hcaptcha";

const QUICK_AMOUNTS = [
  { value: 3000, labelAr: "3,000 ر.س", labelEn: "3,000 SAR", descAr: "صفحة هبوط", descEn: "Landing Page" },
  { value: 5500, labelAr: "5,500 ر.س", labelEn: "5,500 SAR", descAr: "موقع احترافي", descEn: "Pro Website" },
  { value: 8500, labelAr: "8,500 ر.س", labelEn: "8,500 SAR", descAr: "متجر إلكتروني", descEn: "E-Commerce" },
  { value: 12500, labelAr: "12,500 ر.س", labelEn: "12,500 SAR", descAr: "نظام واجهات متقدم", descEn: "UI System" },
  { value: 18500, labelAr: "18,500 ر.س", labelEn: "18,500 SAR", descAr: "باقة متاجر احترافية", descEn: "E-Com Pro" },
  { value: 25000, labelAr: "25,000 ر.س", labelEn: "25,000 SAR", descAr: "حلول رقمية مؤسسية", descEn: "Enterprise Solution" },
  { value: 35000, labelAr: "35,000 ر.س", labelEn: "35,000 SAR", descAr: "منظومة تجارة وتطبيقات", descEn: "Full Digital Platform" },
  { value: 50000, labelAr: "50,000 ر.س", labelEn: "50,000 SAR", descAr: "باقة التحول الرقمي الكاملة", descEn: "Digital Transformation" },
];

const METHODS = [
  { src: "/payment-methods/mastercard.svg", alt: "Mastercard", cls: "h-4 w-auto" },
  { src: "/payment-methods/visa.svg", alt: "Visa", cls: "h-3.5 w-auto" },
  { src: "/payment-methods/mada.svg", alt: "mada", cls: "h-3.5 w-auto" },
  { src: "/payment-methods/apple-pay.svg", alt: "Apple Pay", cls: "h-3.5 w-auto" },
];

type Rules = { minAmount: number; maxAmount: number; enforceAmountLimits: boolean; enableEpayPortal: boolean; paymentsEnabled?: boolean; portalPinRequired?: boolean; epayPinRequired?: boolean };

export function EpayPortal() {
  const params = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState<"ar" | "en">(params.get("lang") === "ar" ? "ar" : "en");
  const ar = lang === "ar";
  const [form, setForm] = useState({
    customerName: params.get("name") || "",
    email: params.get("email") || "",
    phone: params.get("phone") || "",
    amount: params.get("amount") || "",
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [manual, setManual] = useState(() => {
    const initial = params.get("amount") || "";
    if (!initial) return false;
    return !QUICK_AMOUNTS.some((q) => q.value === parseFloat(initial));
  });
  const [error, setError] = useState(params.get("error") || "");
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [rules, setRules] = useState<Rules>({ minAmount: 3000, maxAmount: 55000, enforceAmountLimits: true, enableEpayPortal: true });

  /* ── PIN gate ── */
  const [pinRequired, setPinRequired] = useState<boolean | null>(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.settings?.enableEpayPortal === false || data?.settings?.paymentsEnabled === false) {
          setDisabled(true);
          return;
        }
        if (data?.settings) {
          setRules((prev) => ({ ...prev, ...data.settings }));
          setPinRequired(data.settings.epayPinRequired === true);
        } else {
          setPinRequired(false);
        }
      })
      .catch(() => {
        setPinRequired(false);
      });
  }, [lang, ar]);

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
      setPinError(ar ? "يرجى إدخال الرمز المكون من 4 أرقام" : "Please enter the 4-digit PIN");
      return;
    }
    setPinLoading(true);
    setPinError("");
    try {
      const res = await fetch("/api/portal/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: code, type: "epay" }),
      });
      const data = await res.json();
      if (data.success) {
        setPinVerified(true);
      } else {
        setPinError(data.error || (ar ? "رمز PIN غير صحيح" : "Incorrect PIN"));
        setPinDigits(["", "", "", ""]);
        pinRefs.current[0]?.focus();
      }
    } catch {
      setPinError(ar ? "حدث خطأ في الاتصال" : "Connection error");
    } finally {
      setPinLoading(false);
    }
  }, [pinDigits, ar]);

  const rangeLabel = rules.enforceAmountLimits
    ? `${rules.minAmount.toLocaleString()} - ${rules.maxAmount.toLocaleString()}`
    : "100+";
  const hint = ar
    ? `اختر قيمة الباقة المطلوبة مباشرة أو اكتب أي مبلغ مخصص (${rangeLabel} ر.س)`
    : `Select a package tier or enter custom amount (${rangeLabel} SAR)`;

  const submitToken = useCallback(async (hcaptchaToken: string | null) => {
    const amount = parseFloat(form.amount);
    try {
      const res = await fetch("/api/checkout/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          name: form.customerName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          description: ar ? `ساعات ومجوهرات - ${storeConfig.companyNameAr}` : `Watches & Jewelry - ${storeConfig.companyNameEn}`,
          lang,
          hcaptchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || "failed");
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setLoading(false);
      setShowCaptcha(false);
      setResetSignal((n) => n + 1);
      setError(err?.message || (ar ? "تعذر تشفير وتأمين جلسة الدفع، يرجى المحاولة مرة أخرى." : "Failed to securely initialize payment session. Please retry."));
    }
  }, [form, lang, ar]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.customerName.trim().length < 3) {
      setError(ar ? "يرجى كتابة اسم العميل بشكل صحيح" : "Please provide a valid customer or organization name");
      return;
    }
    const amount = parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(ar ? "يرجى تحديد مبلغ دفع صحيح أكبر من الصفر" : "Please enter a valid amount greater than zero");
      return;
    }
    if (rules.enforceAmountLimits && (amount < rules.minAmount || amount > rules.maxAmount)) {
      setError(ar
        ? `يجب أن يكون مبلغ التحويل بين ${rules.minAmount.toLocaleString()} و ${rules.maxAmount.toLocaleString()} ريال سعودي`
        : `Transfer amount must be between ${rules.minAmount.toLocaleString()} and ${rules.maxAmount.toLocaleString()} SAR`);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError(ar ? "يرجى إدخال بريد إلكتروني صحيح لاستلام الفاتورة" : "Please enter a valid email address for your invoice");
      return;
    }
    if (form.phone.trim().length < 8) {
      setError(ar ? "يرجى إدخال رقم جوال صحيح للتواصل" : "Please enter a valid mobile number");
      return;
    }
    setError("");
    setLoading(true);
    setShowCaptcha(true);
  };

  if (disabled) {
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
          <h2 className="pin-gate-title">{ar ? "رمز الدخول" : "Security PIN"}</h2>
          <p className="pin-gate-subtitle">
            {ar
              ? "أدخل رمز PIN المكون من 4 أرقام للوصول إلى بوابة الدفع"
              : "Enter the 4-digit PIN to access the payment portal"}
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
                <span>{ar ? "تحقق" : "Verify"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const iconSide = ar ? "right-3.5" : "left-3.5";
  const pad = ar ? "pr-10 pl-4" : "pl-10 pr-4";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 text-slate-900 flex flex-col justify-between" dir={ar ? "rtl" : "ltr"}>
      <HcaptchaModal
        open={showCaptcha}
        lang={lang}
        resetSignal={resetSignal}
        onCancel={() => { setShowCaptcha(false); setLoading(false); setResetSignal((n) => n + 1); }}
        onToken={(token) => {
          if (!token) {
            setShowCaptcha(false);
            setLoading(false);
            setError(ar ? "يرجى إكمال التحقق الأمني قبل المتابعة." : "Please complete the security check before continuing.");
            return;
          }
          setShowCaptcha(false);
          void submitToken(token);
        }}
      />
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-slate-200 shrink-0 group-hover:border-blue-400 transition-colors bg-white">
              <img src="/logo.png" alt={storeConfig.companyNameEn} className="h-full w-full object-contain p-0.5" />
            </div>
            <div className="flex flex-col text-start">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                {ar ? storeConfig.companyNameAr : storeConfig.companyNameEn}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {ar ? "تجارة الساعات والمجوهرات" : "Watches & Jewelry"}
              </span>
            </div>
          </a>
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>256-bit SSL</span>
            </div>
            <button type="button" onClick={() => setLang(ar ? "en" : "ar")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span>{ar ? "English" : "العربية"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        {(error || params.get("cancelled")) && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{error || (ar ? "تم إلغاء العملية السابقة. يمكنك مراجعة البيانات والمحاولة مجدداً." : "Previous transaction was cancelled. You can review details and try again.")}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-5 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <BadgePercent className="h-5 w-5 text-amber-300 shrink-0" />
              <span className="font-bold">{ar ? "خصم إضافي 5% متاح تلقائياً عند الدفع الإلكتروني المباشر" : "Automatic 5% Discount on Direct Electronic Checkout"}</span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">
              {ar ? "ساعات ومجوهرات" : "Watches & Jewelry"}
            </span>
          </div>

          <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-6" autoComplete="off">
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-bold text-slate-800">{ar ? "اسم العميل / المؤسسة" : "Full Name / Organization"} <span className="text-rose-500">*</span></label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${iconSide}`} />
                <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder={ar ? "الاسم الكامل أو اسم الجهة" : "Your full name or company name"} className={`w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none ${pad}`} />
              </div>
            </div>

            <div className="space-y-2 text-start">
              <label className="block text-xs font-bold text-slate-800">{ar ? "مبلغ السداد (ريال سعودي)" : "Payment Amount (SAR)"} <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  value={form.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, amount: val });
                    if (!val.trim()) { setManual(false); setSelected(null); }
                    else { setManual(true); setSelected(null); }
                    if (error) setError("");
                  }}
                  placeholder={rangeLabel}
                  className={`w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-950 font-mono text-xl font-black focus:border-blue-500 focus:bg-white focus:outline-none ${ar ? "pr-4 pl-20" : "pl-4 pr-20"}`}
                />
                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center px-3 py-1 rounded-lg bg-slate-200/70 text-slate-700 text-xs font-black font-mono ${ar ? "left-2.5" : "right-2.5"}`}>
                  {ar ? "ر.س" : "SAR"}
                </div>
              </div>
            </div>

            {!manual && (
              <div className="space-y-2 text-start">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    {ar ? "مبالغ سريعة بنقرة واحدة (Quick Amounts)" : "One-Click Quick Amounts"}
                  </span>
                  <span className="text-[11px] text-slate-500">{hint}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {QUICK_AMOUNTS.map((qa) => {
                    const isSelected = selected === qa.value;
                    return (
                      <button
                        key={qa.value}
                        type="button"
                        onClick={() => { setSelected(qa.value); setManual(false); setForm({ ...form, amount: String(qa.value) }); setError(""); }}
                        className={`p-3 rounded-xl border text-start transition-all flex flex-col justify-between ${isSelected ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800"}`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-mono font-black text-sm text-slate-950">{ar ? qa.labelAr : qa.labelEn}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{ar ? qa.descAr : qa.descEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {manual && form.amount.trim() !== "" && (
              <button
                type="button"
                onClick={() => { setManual(false); setSelected(null); setForm((p) => ({ ...p, amount: "" })); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-blue-500" />
                {ar ? "إظهار المبالغ السريعة الجاهزة" : "Show One-Click Quick Amounts"}
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">{ar ? "البريد الإلكتروني للإشعار والفاتورة" : "Email for Invoice & Notification"} <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${iconSide}`} />
                  <input required type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@domain.com" className={`w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:border-blue-500 focus:bg-white focus:outline-none ${ar ? "pr-10 pl-3" : "pl-10 pr-3"}`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">{ar ? "رقم الجوال للتواصل" : "Mobile Number"} <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${iconSide}`} />
                  <input required type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={ar ? "05XXXXXXXX" : "+966 5X XXX XXXX"} className={`w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:border-blue-500 focus:bg-white focus:outline-none ${ar ? "pr-10 pl-3" : "pl-10 pr-3"}`} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-base shadow-lg shadow-blue-600/25 disabled:opacity-70 flex items-center justify-center gap-2.5 active:scale-[0.99]">
              {loading ? (
                <><RefreshCw className="h-5 w-5 animate-spin" /><span>{ar ? "جاري التحويل إلى صفحة الدفع البنكي..." : "Redirecting to Secure Bank Checkout..."}</span></>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-blue-200" />
                  <span>{ar ? "المتابعة إلى صفحة الدفع" : "Proceed to Payment"}</span>
                  {ar ? <ArrowLeft className="h-5 w-5 text-blue-200" /> : <ArrowRight className="h-5 w-5 text-blue-200" />}
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700">{ar ? "وسائل الدفع المقبولة:" : "Accepted Payment Methods:"}</span>
                <div className="flex flex-row items-center gap-2" dir="ltr">
                  {METHODS.map((m) => (
                    <div key={m.alt} className="flex h-8 min-w-12 items-center justify-center rounded-lg border border-slate-200/90 bg-white px-2 shadow-sm">
                      <img src={m.src} alt={m.alt} className={`${m.cls} object-contain`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{ar ? "اتصال مصرفي مشفر بمعيار 256-bit SSL | متوافق مع اشتراطات البنك المركزي والـ PCI-DSS" : "Direct Bank-Grade 256-Bit SSL Encryption | SAMA & PCI-DSS Compliant"}</span>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>
            {ar
              ? `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${storeConfig.companyNameAr}`
              : `All rights reserved © ${new Date().getFullYear()} ${storeConfig.companyNameEn}`}
          </p>
          <div className="flex justify-center gap-4 text-slate-400 text-[11px]">
            <a href="/" className="hover:text-slate-700">{ar ? "الشروط والأحكام" : "Terms & Conditions"}</a>
            <span>•</span>
            <a href="/" className="hover:text-slate-700">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</a>
            <span>•</span>
            <a href="/" className="hover:text-slate-700">{ar ? "سياسة الاسترجاع" : "Refund Policy"}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
