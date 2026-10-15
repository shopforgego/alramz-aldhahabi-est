import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Globe, ShieldCheck } from "lucide-react";
import { storeConfig } from "../config/store";
import { HcaptchaModal } from "./hcaptcha";
import { PaymentMarks } from "./marks";

const QUICK_AMOUNTS = [
  { value: 500, descAr: "إكسسوار فاخر", descEn: "Luxury accessory" },
  { value: 1500, descAr: "ساعة كلاسيكية", descEn: "Classic watch" },
  { value: 3500, descAr: "طقم مجوهرات", descEn: "Jewelry set" },
  { value: 7500, descAr: "ساعة فاخرة", descEn: "Luxury timepiece" },
  { value: 15000, descAr: "قطعة مميزة", descEn: "Signature piece" },
  { value: 25000, descAr: "مجموعة خاصة", descEn: "Private collection" },
  { value: 40000, descAr: "طلب مخصص", descEn: "Bespoke order" },
  { value: 75000, descAr: "مجموعة حصرية", descEn: "Exclusive collection" },
];

type Rules = { minAmount: number; maxAmount: number; enforceAmountLimits: boolean; enableEpayPortal: boolean };

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
  const [manual, setManual] = useState(Boolean(params.get("amount")));
  const [error, setError] = useState(params.get("error") || "");
  const [loading, setLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [rules, setRules] = useState<Rules>({ minAmount: 50, maxAmount: 100000, enforceAmountLimits: true, enableEpayPortal: true });

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
        if (data?.settings) setRules(data.settings);
      })
      .catch(() => undefined);
  }, [lang, ar]);

  const rangeLabel = rules.enforceAmountLimits
    ? `${rules.minAmount.toLocaleString()} - ${rules.maxAmount.toLocaleString()}`
    : ar ? "أي مبلغ" : "Any amount";

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
          description: ar ? "سداد مؤسسة الرمز الذهبي الراقي" : "Al Ramz Al Dhahabi payment",
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
      setError(err?.message || (ar ? "تعذر تأمين جلسة الدفع. حاول مرة أخرى." : "Failed to securely initialize payment session. Please retry."));
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
      setError(ar ? "يرجى تحديد مبلغ دفع صحيح" : "Please enter a valid amount");
      return;
    }
    if (rules.enforceAmountLimits && (amount < rules.minAmount || amount > rules.maxAmount)) {
      setError(ar
        ? `يجب أن يكون المبلغ بين ${rules.minAmount.toLocaleString()} و ${rules.maxAmount.toLocaleString()} ريال`
        : `Amount must be between ${rules.minAmount.toLocaleString()} and ${rules.maxAmount.toLocaleString()} SAR`);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError(ar ? "يرجى إدخال بريد إلكتروني صحيح لاستلام الفاتورة" : "Please enter a valid email address for your invoice");
      return;
    }
    if (form.phone.trim().length < 8) {
      setError(ar ? "يرجى إدخال رقم جوال صحيح" : "Please enter a valid mobile number");
      return;
    }
    setError("");
    setLoading(true);
    setShowCaptcha(true);
  };

  if (disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-sm text-slate-600">This page could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1e7] text-stone-900 flex flex-col" dir={ar ? "rtl" : "ltr"}>
      <HcaptchaModal
        open={showCaptcha}
        lang={lang}
        resetSignal={resetSignal}
        onCancel={() => { setShowCaptcha(false); setLoading(false); }}
        onToken={(token) => {
          if (!token) {
            setShowCaptcha(false);
            setLoading(false);
            setError(ar ? "فشل التحقق الأمني. حاول مرة أخرى." : "Security verification failed. Please try again.");
            return;
          }
          setShowCaptcha(false);
          void submitToken(token);
        }}
      />
      <header className="sticky top-0 z-30 bg-[#064e3b] text-white border-b border-[#d4a24c]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Al Ramz" className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
            <span className="min-w-0">
              <span className="block font-black text-sm sm:text-base truncate">{ar ? storeConfig.companyNameAr : storeConfig.companyNameEn}</span>
              <span className="block text-[11px] text-amber-100/90">{ar ? `سجل تجاري: ${storeConfig.cr}` : `CR: ${storeConfig.cr}`}</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-900/60 border border-amber-300/30 px-3 py-1 text-[11px] font-bold text-amber-100">
              <ShieldCheck className="h-3.5 w-3.5" /> 256-bit SSL
            </span>
            <button type="button" onClick={() => setLang(ar ? "en" : "ar")} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold">
              <Globe className="h-3.5 w-3.5 text-amber-300" />
              {ar ? "English" : "العربية"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {(error || params.get("cancelled")) && (
          <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">{error || (ar ? "تم إلغاء العملية السابقة. يمكنك المحاولة مجدداً." : "Previous transaction was cancelled. You can try again.")}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-white rounded-3xl border border-[#e7d7b1] shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="bg-gradient-to-r from-[#064e3b] via-[#0b6b52] to-[#d4a24c] text-white px-5 py-3.5 text-sm font-bold">
            {ar ? "خصم إضافي 5% عند الدفع الإلكتروني المباشر" : "Automatic 5% consideration on direct electronic checkout"}
          </div>
          <div className="p-5 sm:p-7 space-y-4">
            <Field label={ar ? "اسم العميل / المؤسسة" : "Full Name / Organization"}>
              <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder={ar ? "الاسم الكامل أو اسم الجهة" : "Your full name or company name"} className={inputClass} />
            </Field>
            <Field label={ar ? "البريد الإلكتروني للإشعار والفاتورة" : "Email for Invoice & Notification"}>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@domain.com" className={inputClass} />
            </Field>
            <Field label={ar ? "رقم الجوال للتواصل" : "Mobile Number"}>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05XXXXXXXX" className={inputClass} />
            </Field>
            <Field label={ar ? "مبلغ السداد (ريال سعودي)" : "Payment Amount (SAR)"}>
              <input
                required
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => {
                  setForm({ ...form, amount: e.target.value });
                  setManual(e.target.value.trim() !== "");
                  setSelected(null);
                }}
                placeholder={rangeLabel}
                className={inputClass}
              />
            </Field>

            {!manual && (
              <div>
                <p className="text-xs font-black text-[#064e3b] mb-1">{ar ? "مبالغ سريعة بنقرة واحدة" : "One-Click Quick Amounts"}</p>
                <p className="text-[11px] text-stone-500 mb-3">
                  {ar ? `اختر قيمة أو اكتب مبلغاً مخصصاً (${rangeLabel} ر.س)` : `Select a tier or enter a custom amount (${rangeLabel} SAR)`}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_AMOUNTS.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => {
                        setSelected(item.value);
                        setManual(false);
                        setForm({ ...form, amount: String(item.value) });
                        setError("");
                      }}
                      className={`rounded-2xl border px-3 py-3 text-start transition ${selected === item.value ? "border-[#064e3b] bg-emerald-50" : "border-stone-200 hover:border-amber-400"}`}
                    >
                      <span className="block text-sm font-black text-[#064e3b]">{item.value.toLocaleString()} {ar ? "ر.س" : "SAR"}</span>
                      <span className="block text-[11px] text-stone-500 mt-0.5">{ar ? item.descAr : item.descEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[11px] font-bold text-stone-500 mb-2">{ar ? "وسائل الدفع المقبولة" : "Accepted Payment Methods"}</p>
              <PaymentMarks />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3.5 shadow-lg shadow-amber-500/20 disabled:opacity-60">
              {loading ? (ar ? "جاري التحويل إلى صفحة الدفع البنكي..." : "Redirecting to secure bank checkout...") : (ar ? "المتابعة إلى صفحة الدفع" : "Proceed to Payment")}
            </button>
            <p className="text-[11px] text-center text-stone-500">
              {ar ? "اتصال مصرفي مشفر 256-bit SSL عبر بوابة البنك الأهلي / ماستركارد" : "Bank-grade 256-bit SSL via AlAhli Mastercard gateway"}
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-[#fffcf7] px-3 py-3 text-sm outline-none focus:border-[#064e3b] focus:ring-2 focus:ring-emerald-900/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-stone-700">{label}</span>
      {children}
    </label>
  );
}
