import { dbQuery } from "./db.js";

export type PaymentRules = {
  minAmount: number;
  maxAmount: number;
  enforceAmountLimits: boolean;
  lockPaidHours: number;
  enforcePaidLock: boolean;
  paymentsEnabled: boolean;
  enableOpenPaymentPortal: boolean;
  enableCheckoutPage: boolean;
  enableEpayPortal: boolean;
  ipVelocityPerMinute: number;
  enablePortalPin?: boolean;
  portalPinCode?: string;
  enableEpayPortalPin?: boolean;
  epayPortalPinCode?: string;
  enableCheckoutPin?: boolean;
  checkoutPinCode?: string;
};

const DEFAULTS: PaymentRules = {
  minAmount: 50,
  maxAmount: 100000,
  enforceAmountLimits: true,
  lockPaidHours: 24,
  enforcePaidLock: true,
  paymentsEnabled: true,
  enableOpenPaymentPortal: true,
  enableCheckoutPage: true,
  enableEpayPortal: true,
  ipVelocityPerMinute: 8,
  enablePortalPin: true,
  portalPinCode: "3975",
  enableEpayPortalPin: false,
  epayPortalPinCode: "3975",
  enableCheckoutPin: false,
  checkoutPinCode: "1234",
};

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function parsePaymentRules(parsed: any): PaymentRules {
  return {
    ...DEFAULTS,
    ...parsed,
    minAmount: Number(parsed.minAmount ?? DEFAULTS.minAmount),
    maxAmount: Number(parsed.maxAmount ?? DEFAULTS.maxAmount),
    enforceAmountLimits: parsed.enforceAmountLimits !== false,
    lockPaidHours: Number(parsed.lockPaidHours ?? DEFAULTS.lockPaidHours),
    enforcePaidLock: parsed.enforcePaidLock !== false,
    paymentsEnabled: parsed.paymentsEnabled !== false,
    enableOpenPaymentPortal: parsed.enableOpenPaymentPortal !== false,
    enableCheckoutPage: parsed.enableCheckoutPage !== false,
    enableEpayPortal: parsed.enableEpayPortal !== false,
    ipVelocityPerMinute: Number(parsed.ipVelocityPerMinute ?? DEFAULTS.ipVelocityPerMinute),
    enablePortalPin: parsed.enablePortalPin !== undefined ? Boolean(parsed.enablePortalPin) : DEFAULTS.enablePortalPin,
    portalPinCode: String(parsed.portalPinCode ?? "3975"),
    enableEpayPortalPin: Boolean(parsed.enableEpayPortalPin),
    epayPortalPinCode: String(parsed.epayPortalPinCode ?? "3975"),
    enableCheckoutPin: Boolean(parsed.enableCheckoutPin),
    checkoutPinCode: String(parsed.checkoutPinCode ?? "1234"),
  };
}

async function getRedisRules(): Promise<any> {
  const url = process.env.UPSTASH_REDIS_REST_URL || "https://mail.aldikka.com:8444";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "5981e96f42f5b561d5e5af6e1058ef058359a476fb54e2bd9c241fb66abb8719";
  if (!url || !token) return null;
  try {
    const res = await withTimeout(
      fetch(`${url}/get/system:settings:rules:alramz-aldhahabi`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      1500,
      null as any
    );
    if (!res || !res.ok) return null;
    const data = await res.json();
    if (!data?.result) return null;
    return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
  } catch {
    return null;
  }
}

export async function getPaymentRules(): Promise<PaymentRules> {
  // 1. Try Redis first (fastest, keeps in sync with admin panel)
  try {
    const redisParsed = await getRedisRules();
    if (redisParsed) {
      return parsePaymentRules(redisParsed);
    }
  } catch (err) {
    console.warn("Failed to get alramz rules from Redis:", err);
  }

  // 2. Fallback to PostgreSQL
  try {
    const res = await withTimeout(
      dbQuery("SELECT value FROM system_settings WHERE key = 'payment_rules' LIMIT 1"),
      2000,
      { rows: [] } as any
    );
    const parsed = res?.rows?.[0]?.value || {};
    return parsePaymentRules(parsed);
  } catch (err) {
    console.error("settings read failed", err);
    return DEFAULTS;
  }
}
