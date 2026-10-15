import React, { useEffect, useState } from "react";
import { storeConfig } from "../config/store";
import { HcaptchaModal } from "./hcaptcha";

export function SuccessPage() {
  const q = new URLSearchParams(window.location.search);
  return (
    <div className="min-h-screen bg-[#f6f1e7] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-amber-100 text-center">
        <img src="/logo.png" alt="" className="mx-auto h-16 w-16 rounded-2xl bg-[#064e3b] p-1" />
        <h1 className="mt-4 text-2xl font-black text-[#064e3b]">تم استلام الدفع</h1>
        <p className="mt-1 text-sm text-stone-500">Payment received</p>
        <dl className="mt-5 space-y-2 text-sm text-start">
          <Row k="Order" v={q.get("orderId") || "—"} />
          <Row k="Amount" v={`${q.get("amount") || "—"} SAR`} />
          <Row k="Receipt" v={q.get("receipt") || "—"} />
          <Row k="Name" v={q.get("name") || "—"} />
        </dl>
        <a href="/" className="mt-6 inline-flex rounded-xl bg-[#064e3b] px-5 py-2.5 text-sm font-bold text-amber-100">العودة للمتجر</a>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-stone-100 py-2">
      <dt className="text-stone-500">{k}</dt>
      <dd className="font-bold text-stone-900 break-all">{v}</dd>
    </div>
  );
}

export function InvoicePage() {
  const short = new URLSearchParams(window.location.search).get("short") || "";
  const [link, setLink] = useState<any>(null);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    document.documentElement.dir = "rtl";
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

  if (missing) {
    return <div className="min-h-screen grid place-items-center"><p>404 — This page could not be found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f1e7] px-4 py-8" dir="rtl">
      <HcaptchaModal open={captcha} lang="ar" resetSignal={0} onCancel={() => { setCaptcha(false); setLoading(false); }} onToken={(token) => token ? start(token) : setCaptcha(false)} />
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-xl border border-amber-100">
        <img src="/logo.png" alt="" className="h-14 w-14 rounded-xl" />
        <h1 className="mt-3 text-xl font-black text-[#064e3b]">{storeConfig.companyNameAr}</h1>
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
            <button disabled={loading || link.status !== "ACTIVE"} className="w-full rounded-xl bg-amber-500 py-3 font-black text-slate-950 disabled:opacity-50">المتابعة للدفع</button>
          </form>
        )}
      </div>
    </div>
  );
}
