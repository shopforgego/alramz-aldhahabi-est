import React, { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { PaymentMarks } from "./marks";

type Order = {
  orderId: string;
  amount: string;
  name?: string;
  email?: string;
  phone?: string;
  lang?: string;
  description?: string;
};

declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

export function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(params.get("error") || "");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [apple, setApple] = useState(false);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const lang = (order?.lang === "ar" ? "ar" : "en") as "ar" | "en";
  const ar = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [ar, lang]);

  useEffect(() => {
    if (!token) {
      setError(ar ? "رابط الدفع غير صالح." : "This payment link is invalid.");
      return;
    }
    fetch(`/api/checkout/token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          if (String(data.error || "").toLowerCase().includes("unavailable")) setDisabled(true);
          setError(data.error || "Invalid session");
          return;
        }
        setOrder(data.order);
        setCard((c) => ({ ...c, name: data.order?.name || "" }));
      })
      .catch(() => setError("Unable to load the payment session."));
    const session = window.ApplePaySession;
    if (session && session.canMakePayments?.()) setApple(true);
  }, [token, ar]);

  const device = () => ({
    "3DSecureChallengeWindowSize": "FULL_SCREEN",
    acceptHeaders: "*/*",
    colorDepth: window.screen?.colorDepth || 24,
    javaEnabled: false,
    language: navigator.language || lang,
    screenHeight: window.screen?.height || 844,
    screenWidth: window.screen?.width || 390,
    timeZone: new Date().getTimezoneOffset(),
  });

  const payCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    const [month, year] = card.expiry.split("/").map((s) => s.trim());
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          device: device(),
          card: {
            number: card.number.replace(/\s+/g, ""),
            nameOnCard: card.name,
            expiryMonth: month,
            expiryYear: year,
            securityCode: card.cvv,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Payment failed");
      if (data.status === "3DS_CHALLENGE" && data.html) {
        setChallenge(data.html);
        setLoading(false);
        return;
      }
      const q = new URLSearchParams({
        orderId: data.orderId || order.orderId,
        amount: data.amount || order.amount,
        receipt: data.receipt || "",
        stan: data.stan || "",
        name: order.name || "",
      });
      window.location.href = `/epay/success?${q.toString()}`;
    } catch (err: any) {
      setError(err?.message || "Unable to process payment.");
      setLoading(false);
    }
  };

  const payApple = async () => {
    if (!order || !window.ApplePaySession) return;
    const session = new window.ApplePaySession(6, {
      countryCode: "SA",
      currencyCode: "SAR",
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["mada", "visa", "masterCard"],
      total: { label: "Al Ramz Al Dhahabi", amount: Number(order.amount).toFixed(2) },
    });
    session.onvalidatemerchant = async (event: any) => {
      const res = await fetch("/api/applepay/validate-merchant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validationURL: event.validationURL, domain: window.location.hostname }),
      });
      const merchantSession = await res.json();
      if (!res.ok || merchantSession.error) {
        session.abort();
        setError(merchantSession.error || "Apple Pay validation failed");
        return;
      }
      session.completeMerchantValidation(merchantSession);
    };
    session.onpaymentauthorized = async (event: any) => {
      const res = await fetch("/api/applepay/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, paymentToken: event.payment.token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        setError(data.error || "Apple Pay failed");
        return;
      }
      session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
      const q = new URLSearchParams({
        orderId: data.orderId,
        amount: data.amount,
        receipt: data.receipt || "",
        stan: data.stan || "",
        name: order.name || "",
      });
      window.location.href = `/epay/success?${q.toString()}`;
    };
    session.oncancel = () => setError(ar ? "تم إلغاء Apple Pay." : "Apple Pay was cancelled.");
    session.begin();
  };

  if (disabled) {
    return <div className="min-h-screen grid place-items-center bg-white"><p className="text-sm">This page could not be found.</p></div>;
  }

  const amountLabel = order ? Number(order.amount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—";

  return (
    <div className="min-h-screen bg-[#f6f1e7] text-[#141414] px-4 py-6" dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto w-full max-w-[460px]">
        <header className="mb-4 flex items-center justify-between">
          <a href="/epay"><img src="/logo.png" alt="Al Ramz" className="h-10 w-auto bg-white rounded-lg p-1" /></a>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600"><Lock className="h-3.5 w-3.5" /> Secure Checkout</span>
        </header>
        <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
          <span className="text-2xl font-black">{amountLabel} ﷼</span>
          <span className="text-xs text-stone-500">{order?.orderId}</span>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</div>}
        {apple && (
          <>
            <button type="button" onClick={payApple} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-white font-semibold">
              Apple Pay
            </button>
            <p className="my-3 text-center text-[11px] tracking-widest text-stone-400">OR PAY WITH CARD</p>
          </>
        )}
        <form onSubmit={payCard} className="space-y-3 rounded-3xl bg-white p-4 shadow-sm border border-[#eadfca]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{ar ? "بطاقة مدى أو ائتمان" : "Credit or Debit card"}</h2>
            <PaymentMarks />
          </div>
          <label className="block text-xs font-bold">{ar ? "اسم حامل البطاقة" : "Cardholder name"}
            <input required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 bg-[#f8fbff] px-3 py-3 text-sm" />
          </label>
          <label className="block text-xs font-bold">{ar ? "رقم البطاقة" : "Card number"}
            <input required inputMode="numeric" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="•••• •••• •••• ••••" className="mt-1 w-full rounded-xl border border-stone-200 bg-[#f8fbff] px-3 py-3 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold">{ar ? "تاريخ الانتهاء" : "Expiry"}
              <input required value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM / YY" className="mt-1 w-full rounded-xl border border-stone-200 bg-[#f8fbff] px-3 py-3 text-sm" />
            </label>
            <label className="block text-xs font-bold">{ar ? "رمز الأمان" : "Security code"}
              <input required value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="•••" className="mt-1 w-full rounded-xl border border-stone-200 bg-[#f8fbff] px-3 py-3 text-sm" />
            </label>
          </div>
          <button disabled={loading || !order} className="mt-2 w-full rounded-xl bg-[#064e3b] py-3.5 font-black text-amber-100 disabled:opacity-60">
            {loading ? (ar ? "جارٍ التحقق..." : "Verifying...") : `${ar ? "ادفع" : "Pay"} ${amountLabel} ﷼`}
          </button>
        </form>
        <p className="mt-6 text-center text-sm font-bold text-[#064e3b]">Al Ramz Al Dhahabi</p>
      </div>
      {challenge && (
        <div className="fixed inset-0 z-50 bg-black/50 p-3">
          <div className="mx-auto h-full max-w-lg overflow-auto rounded-2xl bg-white" dangerouslySetInnerHTML={{ __html: challenge }} />
        </div>
      )}
    </div>
  );
}
