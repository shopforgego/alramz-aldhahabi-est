import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Lock, RefreshCw, ShieldCheck, X } from "lucide-react";
import { storeConfig } from "../config/store";

const LANGUAGES_LIST = [
  { code: "ar", label: "عربى (MENA)" },
  { code: "en", label: "English (United States)" },
  { code: "cs", label: "Český (Czech Republic)" },
  { code: "de", label: "Deutsch (Germany)" },
  { code: "de-at", label: "Deutsch (Austria)" },
  { code: "el", label: "Ελληνικά (Greece)" },
  { code: "et", label: "Eesti keel (Estonia)" },
  { code: "es", label: "Español (Spain)" },
  { code: "es-mx", label: "Español (Mexico)" },
  { code: "fr", label: "Français (France)" },
  { code: "fr-ca", label: "Français (Canada)" },
  { code: "id", label: "Indonesia (Indonesia)" },
  { code: "it", label: "Italiano (Italy)" },
  { code: "ja", label: "日本語 (Japan)" },
  { code: "ka", label: "ქართული (Georgia)" },
  { code: "my", label: "ဗမာ (မြန်မာ) (Myanmar)" },
  { code: "lv", label: "Latviski (Latvia)" },
  { code: "lt", label: "Lietuvių (Lithuania)" },
  { code: "nl", label: "Nederlands (Netherlands)" },
  { code: "pl", label: "Polski (Poland)" },
  { code: "pt", label: "Português (Portugal)" },
  { code: "ro", label: "Română (Romania)" },
  { code: "sk", label: "Slovensky (Slovakia)" },
  { code: "vi", label: "Tiếng Việt (Vietnam)" },
  { code: "zh", label: "中文 (China)" },
  { code: "zh-hk", label: "中文 (China - Hong Kong)" },
];

type Order = {
  orderId: string;
  amount: string;
  name?: string;
  email?: string;
  phone?: string;
  lang?: string;
  description?: string;
  shortCode?: string;
};

declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

function formatTimer(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CheckoutPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const [lang, setLang] = useState<"ar" | "en">(params.get("lang") === "ar" ? "ar" : "en");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState("");
  const [showChallenge, setShowChallenge] = useState(false);
  const [apple, setApple] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [expired, setExpired] = useState(false);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const challengeRef = useRef<HTMLDivElement>(null);
  const ar = lang === "ar";

  /* ── Bank Checkout PIN Gate ── */
  const [checkoutPinRequired, setCheckoutPinRequired] = useState<boolean | null>(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.settings) {
          if (data.settings.enableCheckoutPage === false) {
            setDisabled(true);
            return;
          }
          setCheckoutPinRequired(Boolean(data.settings.checkoutPinRequired));
        } else {
          setCheckoutPinRequired(false);
        }
      })
      .catch(() => {
        setCheckoutPinRequired(false);
      });
  }, []);

  const handlePinChange = (index: number, value: string) => {
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
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setPinDigits(pasted.split(""));
      pinRefs.current[3]?.focus();
    }
  };

  const submitPin = async () => {
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
        body: JSON.stringify({ pin: code, type: "checkout" }),
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
  };

  useEffect(() => {
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [ar, lang]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    let activeToken = token;
    if (!activeToken) {
      try {
        const saved = sessionStorage.getItem("alramz_checkout_token") || "";
        if (saved) {
          search.set("token", saved);
          window.location.replace(`/epay/checkout?${search.toString()}`);
          return;
        }
      } catch {
        /* ignore */
      }
      setInvalid(true);
      setError(ar ? "رابط الدفع غير صالح." : "This payment link is invalid.");
      return;
    }
    try {
      sessionStorage.setItem("alramz_checkout_token", activeToken);
    } catch {
      /* ignore */
    }
    const bankError = search.get("error");
    if (bankError) setError(bankError);
    fetch(`/api/checkout/token?token=${encodeURIComponent(activeToken)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          if (String(data.error || "").toLowerCase().includes("unavailable")) setDisabled(true);
          const message = data.error || (ar ? "تعذر فتح جلسة الدفع." : "Unable to open this payment session.");
          const expiredSession = /expir/i.test(message);
          setInvalid(true);
          setError(expiredSession ? (ar ? "انتهت مهلة الدفع. ابدأ العملية من جديد." : "This payment session has expired. Please start again.") : message);
          return;
        }
        const next = data.order as Order;
        setOrder(next);
        if (next.lang === "ar" || next.lang === "en") setLang(next.lang);
        setCard((c) => ({ ...c, name: (next.name || "").toUpperCase() }));
        try {
          sessionStorage.setItem(
            "alramz_payment_session",
            JSON.stringify({
              orderId: next.orderId,
              amount: next.amount,
              customerName: next.name || "",
              email: next.email || "",
              phone: next.phone || "",
              description: next.description || "",
            }),
          );
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        setInvalid(true);
        setError("Unable to load the payment session.");
      });
    const session = window.ApplePaySession;
    if (session?.canMakePayments?.()) setApple(true);
  }, [token]);

  useEffect(() => {
    if (!order?.orderId || expired) return;
    const key = `alramz_checkout_timer_${order.orderId}`;
    const timeoutSec = 15 * 60;
    try {
      const stored = sessionStorage.getItem(key);
      const now = Date.now();
      if (stored) {
        const elapsed = Math.floor((now - Number(stored)) / 1000);
        if (elapsed >= timeoutSec) {
          setSecondsLeft(0);
          setExpired(true);
          return;
        }
        setSecondsLeft(timeoutSec - elapsed);
      } else {
        sessionStorage.setItem(key, String(now));
        setSecondsLeft(timeoutSec);
      }
    } catch {
      setSecondsLeft(timeoutSec);
    }
  }, [order?.orderId, expired]);

  useEffect(() => {
    if (expired || !order) return;
    if (secondsLeft <= 0) {
      setExpired(true);
      setError(ar ? "انتهت مهلة الدفع. يرجى العودة وبدء عملية جديدة." : "This payment session has expired. Please go back and start again.");
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, expired, order, ar]);

  useEffect(() => {
    if (!showChallenge || !challenge || !challengeRef.current) return;
    challengeRef.current.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "520px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    challengeRef.current.appendChild(iframe);
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(challenge);
      doc.close();
    }
  }, [showChallenge, challenge]);

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

  const goSuccess = (data: { orderId?: string; amount?: string; receipt?: string; stan?: string }) => {
    const q = new URLSearchParams({
      orderId: data.orderId || order?.orderId || "",
      amount: data.amount || order?.amount || "",
      receipt: data.receipt || "",
      stan: data.stan || "",
      name: order?.name || "",
      email: order?.email || "",
      phone: order?.phone || "",
      lang,
      status: "SUCCESS",
    });
    try {
      sessionStorage.setItem(
        "alramz_payment_session",
        JSON.stringify({
          orderId: q.get("orderId"),
          amount: q.get("amount"),
          customerName: order?.name || "",
          email: order?.email || "",
          phone: order?.phone || "",
          receipt: data.receipt || "",
          stan: data.stan || "",
          status: "SUCCESS",
        }),
      );
    } catch {
      /* ignore */
    }
    window.location.href = `/epay/success?${q.toString()}`;
  };

  const payCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || expired || invalid) return;
    const clean = card.number.replace(/\s+/g, "");
    if (clean.length < 15) {
      setError(ar ? "يرجى إدخال رقم بطاقة صحيح." : "Please enter a valid card number.");
      return;
    }
    const [month, year] = card.expiry.split("/").map((s) => s.trim());
    if (!month || month.length !== 2 || !year) {
      setError(ar ? "يرجى إدخال تاريخ انتهاء صحيح (MM/YY)." : "Please enter a valid expiry date (MM/YY).");
      return;
    }
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
            number: clean,
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
        setShowChallenge(true);
        setLoading(false);
        return;
      }
      goSuccess(data);
    } catch (err: any) {
      setError(err?.message || "Unable to process payment. Please verify card details and try again.");
      setLoading(false);
    }
  };

  const payApple = async () => {
    if (!order || !window.ApplePaySession || expired || invalid) return;
    setAppleLoading(true);
    setError("");
    const session = new window.ApplePaySession(6, {
      countryCode: "SA",
      currencyCode: "SAR",
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["mada", "visa", "masterCard"],
      total: {
        label: ar ? "مؤسسة الرمز الذهبي الراقي" : "Al Ramz Al Dhahabi",
        amount: Number(order.amount).toFixed(2),
      },
    });
    session.onvalidatemerchant = async (event: any) => {
      try {
        const res = await fetch("/api/applepay/validate-merchant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ validationURL: event.validationURL, domain: window.location.hostname }),
        });
        const merchantSession = await res.json();
        if (!res.ok || merchantSession.error) throw new Error(merchantSession.error || "Apple Pay validation failed");
        session.completeMerchantValidation(merchantSession);
      } catch (err: any) {
        session.abort();
        setAppleLoading(false);
        setError(err?.message || "Merchant validation failed with Apple");
      }
    };
    session.onpaymentauthorized = async (event: any) => {
      try {
        const res = await fetch("/api/applepay/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, paymentToken: event.payment.token }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          setAppleLoading(false);
          setError(data.error || "Apple Pay failed");
          return;
        }
        session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        goSuccess(data);
      } catch (err: any) {
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        setAppleLoading(false);
        setError(err?.message || "Error processing payment");
      }
    };
    session.oncancel = () => {
      setAppleLoading(false);
      setError(ar ? "تم إلغاء Apple Pay." : "Apple Pay was cancelled.");
    };
    session.begin();
  };

  const goBack = () => {
    const orderIdVal = (order?.orderId || order?.shortCode || "").trim();
    if (orderIdVal.toUpperCase().startsWith("BS-")) {
      window.location.href = `/sa?short=${encodeURIComponent(orderIdVal.toUpperCase())}`;
      return;
    }
    window.location.href = "/epay";
  };

  if (disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 font-sans p-4">
        <div className="flex items-center space-x-4 divide-x divide-slate-300">
          <h1 className="text-2xl font-bold px-4 tracking-tight">404</h1>
          <div className="px-4 text-sm text-slate-600 font-normal">This page could not be found.</div>
        </div>
      </div>
    );
  }

  if (checkoutPinRequired === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#0053a4" }} />
      </div>
    );
  }

  if (checkoutPinRequired && !pinVerified) {
    return (
      <div className="pin-gate-overlay">
        <div className="pin-gate-card">
          <div className="pin-gate-icon">
            <Lock className="h-10 w-10" style={{ color: "#0053a4" }} />
          </div>
          <h2 className="pin-gate-title">{ar ? "رمز الدخول" : "Security PIN"}</h2>
          <p className="pin-gate-subtitle">
            {ar
              ? "أدخل رمز PIN المكون من 4 أرقام للوصول إلى صفحة الدفع البنكي"
              : "Enter the 4-digit PIN to access the checkout page"}
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

  const formattedAmount = order
    ? Number(order.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";
  const cleanLen = card.number.replace(/\s+/g, "").length;
  const formReady =
    card.name.trim().length >= 3 &&
    cleanLen >= 15 &&
    card.expiry.replace(/\s+/g, "").length >= 4 &&
    card.cvv.trim().length >= 3;
  const blocked = invalid || expired || !order;

  const onNumber = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 19);
    setCard((c) => ({ ...c, number: raw.replace(/(\d{4})/g, "$1 ").trim() }));
    if (error) setError("");
  };
  const onExpiry = (value: string) => {
    let raw = value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) raw = `${raw.slice(0, 2)} / ${raw.slice(2)}`;
    setCard((c) => ({ ...c, expiry: raw }));
    if (error) setError("");
  };

  return (
    <div
      className="min-h-screen bg-white text-[#141414] py-6 px-4 sm:px-6 flex flex-col justify-between selection:bg-[#d24646] selection:text-white"
      dir={ar ? "rtl" : "ltr"}
      style={{
        fontFamily: ar
          ? "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans Arabic\", Tahoma, Arial, sans-serif"
          : "-apple-system, BlinkMacSystemFont, \"San Francisco\", \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif",
      }}
    >
      <div className="w-full max-w-[430px] sm:max-w-[460px] mx-auto">
        <header className="flex items-center justify-between pb-3 border-b border-transparent">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt={storeConfig.companyNameEn} className="h-8 sm:h-9 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#495057] font-medium tracking-tight">
            <Lock className="w-3.5 h-3.5 text-[#495057]" />
            <span>Secure Checkout</span>
          </div>
        </header>

        <div className="pt-4 pb-3 flex items-center justify-between border-b border-[#e5e7eb]/70">
          <span className="text-[22px] sm:text-[24px] font-bold tracking-tight text-[#141414]">{formattedAmount} ﷼</span>
          <button
            type="button"
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="text-xs sm:text-sm font-normal text-[#141414] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{ar ? "ملخص الطلب" : "Order summary"}</span>
            <span className="text-[10px]">{summaryOpen ? "▲" : "▼"}</span>
          </button>
        </div>

        {summaryOpen && order && (
          <div className="mt-2.5 p-3.5 bg-[#f8f9fa] border border-[#e9ecef] rounded text-xs space-y-2 text-[#212529]">
            <div className="flex justify-between items-center text-slate-600">
              <span>{ar ? "رقم الطلب" : "Order Ref"}:</span>
              <span className="font-mono font-bold text-slate-800">#{order.orderId}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>{ar ? "تفاصيل الخدمة" : "Service Description"}:</span>
              <span className="font-medium text-slate-800 text-end">{order.description || (ar ? "دفع إلكتروني" : "Electronic payment")}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-[#141414]">
              <span>{ar ? "المجموع الكلي" : "Total Amount"}:</span>
              <span>{formattedAmount} ﷼</span>
            </div>
          </div>
        )}

        <div className="pt-3 pb-2 text-start">
          <button type="button" onClick={goBack} className="text-xs sm:text-sm font-medium text-[#d24646] hover:underline inline-flex items-center gap-1 cursor-pointer">
            {ar ? (
              <>
                <span>الخلف</span>
                <span>&gt;</span>
              </>
            ) : (
              <>
                <span>&lt;</span>
                <span>Back</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full bg-[#f8f9fa] border border-[#e9ecef] rounded p-3 sm:p-3.5 flex items-center gap-3 my-3">
          <svg className="w-5 h-5 text-[#5b8a36] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" stroke="#5b8a36" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
          </svg>
          <span className="text-xs sm:text-[13.5px] font-normal text-[#212529]">
            {ar ? (
              <>
                <span>الدقائق المتبقية لهذا الدفع: </span>
                <strong className="font-bold text-black">{formatTimer(secondsLeft)}</strong>
              </>
            ) : (
              <>
                <span>Minutes remaining for this payment: </span>
                <strong className="font-bold text-black">{formatTimer(secondsLeft)}</strong>
              </>
            )}
          </span>
        </div>

        {invalid && (
          <div className="w-full my-4 p-5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 space-y-3 shadow-xs text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <strong className="block font-bold text-sm text-rose-900">
                {/expir|انتهت/i.test(error)
                  ? (ar ? "انتهت مهلة هذا الدفع" : "This payment session has expired")
                  : (ar ? "تعذر فتح جلسة الدفع" : "Unable to open this payment session")}
              </strong>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed max-w-sm mx-auto">
                {error || (ar ? "ارجع لصفحة البيانات وابدأ الدفع من جديد." : "Go back and start the payment again.")}
              </p>
            </div>
          </div>
        )}

        {error && !invalid && (
          <div className="w-full my-3 p-3 rounded bg-[#d7373c1a] border-t-4 border-[#D7373C] text-xs text-[#721c24] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D7373C] shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {!blocked && apple && (
          <div className="w-full my-3">
            <button
              type="button"
              onClick={payApple}
              disabled={appleLoading}
              className="w-full h-12 bg-black hover:bg-neutral-900 text-white rounded-xl flex items-center justify-center shadow-xs transition-all cursor-pointer disabled:opacity-70"
              aria-label="Pay with Apple Pay"
            >
              {appleLoading ? (
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>{ar ? "جاري تهيئة Apple Pay..." : "Initializing Apple Pay..."}</span>
                </span>
              ) : (
                <svg className="h-7 w-auto fill-white" viewBox="0 0 512 210.2" xmlns="http://www.w3.org/2000/svg" aria-label="Apple Pay">
                  <path d="M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z" />
                </svg>
              )}
            </button>
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-500 shrink-0 select-none">
                {ar ? "أو الدفع بالبطاقة المصرفية" : "OR Pay with Card"}
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>
        )}

        {!blocked && (
          <>
            <div className="pt-2 pb-3 flex items-center justify-between gap-2">
              <h2 className="text-[17px] sm:text-lg font-normal text-[#141414] tracking-tight">
                {ar ? "بطاقة ائتمان أو خصم مباشر" : "Credit or Debit card"}
              </h2>
              <div className="flex items-center gap-1.5 shrink-0">
                <img src="/images/mpgs/mastercard.svg" alt="Mastercard" className="h-4.5 w-auto object-contain" />
                <img src="/images/mpgs/visa.svg" alt="Visa" className="h-3.5 w-auto object-contain" />
                <img src="/payment-methods/mada.svg" alt="mada" className="h-3.5 w-auto object-contain" />
              </div>
            </div>

            <form onSubmit={payCard} className="space-y-4 text-start">
              <div>
                <label className="block text-[14px] font-bold text-black mb-1.5">
                  {ar ? "اسم حامل البطاقة (كما هو مبين على البطاقة)" : "Cardholder name (exactly as shown on card)"}{" "}
                  <span className="text-[#d24646] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                  className="w-full h-[40px] px-3 border border-[#767676] rounded-[4px] text-sm text-black uppercase focus:border-2 focus:border-[#d24646] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-black mb-1.5">
                  {ar ? "رقم البطاقة" : "Card number"} <span className="text-[#d24646] font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    required
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    onChange={(e) => onNumber(e.target.value)}
                    className={`w-full h-[40px] px-3 border border-[#767676] rounded-[4px] text-sm font-mono text-black focus:border-2 focus:border-[#d24646] focus:outline-none transition-colors ${ar ? "pl-9 text-right" : "pr-9 text-left"}`}
                  />
                  <div className={`absolute inset-y-0 ${ar ? "left-0 pl-3" : "right-0 pr-3"} flex items-center pointer-events-none`}>
                    <Lock className="w-3.5 h-3.5 text-[#495057]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-black mb-1.5">
                  {ar ? "تاريخ انتهاء الصلاحية" : "Expiry date"} <span className="text-[#d24646] font-bold">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={card.expiry}
                  onChange={(e) => onExpiry(e.target.value)}
                  placeholder="MM / YY"
                  className={`w-full h-[40px] px-3 border border-[#767676] rounded-[4px] text-sm font-mono text-black placeholder:text-[#6c757d] focus:border-2 focus:border-[#d24646] focus:outline-none transition-colors ${ar ? "text-right" : "text-left"}`}
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-black mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span>{ar ? "رمز الأمان" : "Security code"}</span>
                    <span className="text-[#d24646] font-bold">*</span>
                    <span title="3 or 4 digits CVV on the back of card" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#495057] text-white text-[10px] font-bold">?</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    maxLength={4}
                    required
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    className={`w-full h-[40px] px-3 border border-[#767676] rounded-[4px] text-sm font-mono text-black focus:border-2 focus:border-[#d24646] focus:outline-none transition-colors ${ar ? "pl-11 text-right" : "pr-11 text-left"}`}
                  />
                  <div className={`absolute inset-y-0 ${ar ? "left-0 pl-2.5" : "right-0 pr-2.5"} flex items-center pointer-events-none`}>
                    <div className="w-6 h-4 border border-slate-500 rounded-xs flex flex-col justify-between py-0.5 px-0.5 bg-white">
                      <div className="w-full h-1 bg-slate-800" />
                      <div className="w-2.5 h-1 bg-[#d2292e] self-end" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || blocked || !formReady}
                  className={`w-full h-[42px] rounded font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all select-none ${
                    formReady && !loading && !blocked
                      ? "bg-[#D24646] hover:bg-[#be3232] text-white shadow-xs active:scale-[0.99] cursor-pointer"
                      : "bg-[#e9ecef] text-[#6c757d] cursor-pointer"
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>{ar ? "جاري الدفع والمعالجة..." : "Processing payment..."}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>{ar ? `الدفع ${formattedAmount} ﷼` : `Pay ${formattedAmount} ﷼`}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-[#212529]">{ar ? "مؤسسة الرمز الذهبي الراقي" : "AlRamzGold"}</p>
        </div>

        <div className="mt-2 text-center">
          <button type="button" onClick={() => setShowLangModal(true)} className="inline-flex items-center gap-1.5 text-xs text-[#212529] hover:underline cursor-pointer">
            <img src="/images/mpgs/language-selector-icon.svg" alt="" className="h-3.5 w-auto" />
            <span>{ar ? "عربى (MENA)" : "English (United States)"}</span>
            <span className="text-[11px]">&gt;</span>
          </button>
        </div>

        <div className="mt-6 pt-2 flex justify-center">
          <img src="/images/snb-logo.png" alt="الأهلي SNB" className="h-12 sm:h-14 w-auto object-contain" />
        </div>
      </div>

      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full max-h-[85vh] flex flex-col overflow-hidden text-start" dir={ar ? "rtl" : "ltr"}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#141414]">{ar ? "اختر لغتك" : "Select your language"}</h3>
              <button type="button" onClick={() => setShowLangModal(false)} className="text-slate-500 hover:text-slate-800 text-lg font-bold p-1 cursor-pointer">✕</button>
            </div>
            <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100">
              {LANGUAGES_LIST.map((l) => {
                const isSelected = (l.code === "ar" && ar) || (l.code === "en" && !ar);
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLang(l.code === "ar" ? "ar" : "en");
                      setShowLangModal(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 rounded text-xs sm:text-sm text-[#212529] cursor-pointer"
                  >
                    <span>{l.label}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#d24646] bg-[#d24646]" : "border-slate-300"}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold">{ar ? "التحقق المصرفي الآمن (3D Secure)" : "3D Secure Bank Verification"}</span>
              </div>
              <button type="button" onClick={() => setShowChallenge(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div ref={challengeRef} className="min-h-[500px] w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
