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

export async function getPaymentRules(): Promise<PaymentRules> {
  try {
    const res = await withTimeout(
      dbQuery("SELECT value FROM system_settings WHERE key = 'payment_rules' LIMIT 1"),
      2500,
      { rows: [] } as any
    );
    const parsed = res?.rows?.[0]?.value || {};
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
  } catch (err) {
    console.error("settings read failed", err);
    return DEFAULTS;
  }
}
